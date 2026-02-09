import {
  Auction,
  AuctionLane,
  AuctionRuleset,
  AuctionStatus,
  AuctionType,
  AuditEntityType,
  AuditEvent,
  AuditEventType,
  Bid,
  CreateAuctionRequest,
  LaneStatus,
  RFI,
  RFIStatus,
  VendorInterest,
  RFQ,
  RFQStatus,
  RFQLane,
  VendorQuote,
  Award,
  TransportContract,
  ContractStatus,
  ContractLane,
  ContractVendorAllocation,
  ContractPricingBasis,
  Indent,
  PlacementSLA,
  IndentPlacementTracker,
  PlacementStatus,
  SpotAuction,
  SpotBid,
  SpotAuctionStatus,
} from '../types';

/**
 * Singleton class acting as the Backend Service/Database.
 * In a real app, this would be a NodeJS/Go backend with Postgres/Redis.
 */
class AuctionEngine {
  // Phase 0 Stores
  private auctions: Map<string, Auction> = new Map();
  private lanes: Map<string, AuctionLane> = new Map();
  private rulesets: Map<string, AuctionRuleset> = new Map();
  private bids: Map<string, Bid[]> = new Map(); // laneId -> Bids
  private auditLog: AuditEvent[] = []; 

  // Phase 1 Stores
  private rfis: Map<string, RFI> = new Map();
  private vendorInterests: VendorInterest[] = [];
  private rfqs: Map<string, RFQ> = new Map();
  private rfqLanes: Map<string, RFQLane> = new Map();
  private vendorQuotes: VendorQuote[] = [];
  private awards: Map<string, Award> = new Map(); // laneId -> Award

  // Phase 2A Stores
  private contracts: Map<string, TransportContract> = new Map();
  private contractLanes: Map<string, ContractLane> = new Map();
  private contractAllocations: ContractVendorAllocation[] = [];

  // Phase 2B Stores (TMS Simulation)
  private indents: Indent[] = [];

  // Phase 3A Stores (SLA)
  private placementSLAs: Map<string, PlacementSLA> = new Map(); // contractLaneId -> SLA
  private indentTrackers: Map<string, IndentPlacementTracker> = new Map();

  // Phase 3B Stores (Spot)
  private spotAuctions: Map<string, SpotAuction> = new Map();
  private spotBids: Map<string, SpotBid[]> = new Map();

  // Subscribers for reactivity
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.seedData();
    setInterval(() => this.tick(), 1000);
  }

  // --- Public API ---

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public getSnapshot() {
    return {
      auctions: Array.from(this.auctions.values()),
      lanes: Array.from(this.lanes.values()),
      auditLog: [...this.auditLog].sort((a, b) => b.createdAt - a.createdAt),
      // Phase 1 Snapshots
      rfis: Array.from(this.rfis.values()),
      rfqs: Array.from(this.rfqs.values()),
      // Phase 2A
      contracts: Array.from(this.contracts.values()),
      // Phase 2B
      indents: [...this.indents],
      // Phase 3A
      trackers: Array.from(this.indentTrackers.values()),
      // Phase 3B
      spotAuctions: Array.from(this.spotAuctions.values()),
    };
  }

  public getAuction(id: string) { return this.auctions.get(id); }
  public getRuleset(id: string) { return this.rulesets.get(id); }
  public getLanesByAuction(auctionId: string) {
    return Array.from(this.lanes.values())
      .filter((l) => l.auctionId === auctionId)
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  }
  public getBidsByLane(laneId: string) {
    return (this.bids.get(laneId) || []).sort((a, b) => a.bidAmount - b.bidAmount);
  }
  public getLane(laneId: string) { return this.lanes.get(laneId); }
  
  // Phase 1 Getters
  public getRFI(id: string) { return this.rfis.get(id); }
  public getVendorInterests(rfiId: string) { return this.vendorInterests.filter(vi => vi.rfiId === rfiId); }
  public getRFQ(id: string) { return this.rfqs.get(id); }
  public getRFQLanes(rfqId: string) { return Array.from(this.rfqLanes.values()).filter(l => l.rfqId === rfqId); }
  public getVendorQuotes(rfqLaneId: string) { return this.vendorQuotes.filter(vq => vq.rfqLaneId === rfqLaneId); }
  public getAward(laneId: string) { return this.awards.get(laneId); }

  // Phase 2A Getters
  public getContract(id: string) { return this.contracts.get(id); }
  public getContractLanes(contractId: string) { return Array.from(this.contractLanes.values()).filter(cl => cl.contractId === contractId); }
  public getContractAllocations(contractLaneId: string) { return this.contractAllocations.filter(ca => ca.contractLaneId === contractLaneId); }
  public getContracts() { return Array.from(this.contracts.values()); }
  public getContractLane(id: string) { return this.contractLanes.get(id); }

  // Phase 2B Getters
  public getIndents(contractLaneId?: string) {
      if(contractLaneId) return this.indents.filter(i => i.contractLaneId === contractLaneId);
      return this.indents;
  }
  public getIndent(id: string) { return this.indents.find(i => i.id === id); }

  // Phase 3A Getters
  public getPlacementSLA(contractLaneId: string) { return this.placementSLAs.get(contractLaneId); }
  public getTrackersByVendor(vendorId: string) { return Array.from(this.indentTrackers.values()).filter(t => t.assignedVendorId === vendorId); }
  public getAllTrackers() { return Array.from(this.indentTrackers.values()).sort((a,b) => b.slaStartTime - a.slaStartTime); }

  // Phase 3B Getters
  public getSpotAuctions() { return Array.from(this.spotAuctions.values()).sort((a,b) => b.startedAt - a.startedAt); }
  public getSpotBids(spotAuctionId: string) { return (this.spotBids.get(spotAuctionId) || []).sort((a,b) => a.bidAmount - b.bidAmount); }
  public getSpotAuction(id: string) { return this.spotAuctions.get(id); }


  // --- Phase 3B: Spot Auctions ---

  public triggerSpotAuction(indentId: string) {
      const indent = this.indents.find(i => i.id === indentId);
      if(!indent) { console.error("Spot Trigger Failed: Indent not found"); return; }
      
      const spotId = crypto.randomUUID();
      const spot: SpotAuction = {
          id: spotId,
          indentId: indent.id,
          contractLaneId: indent.contractLaneId,
          status: SpotAuctionStatus.RUNNING,
          startedAt: Date.now(),
          durationSeconds: 300, // 5 minutes default
      };

      this.spotAuctions.set(spotId, spot);
      this.spotBids.set(spotId, []);

      this.logEvent({
          entityType: AuditEntityType.SPOT_AUCTION,
          entityId: spotId,
          eventType: AuditEventType.SPOT_TRIGGERED,
          triggeredBy: 'SYSTEM',
          payload: { indentId, reason: 'SLA_BREACH' }
      });
      this.notify();
  }

  public placeSpotBid(spotAuctionId: string, vendorId: string, amount: number) {
      const spot = this.spotAuctions.get(spotAuctionId);
      if(!spot) throw new Error("Spot Auction not found");
      if(spot.status !== SpotAuctionStatus.RUNNING) throw new Error("Auction is not running");
      
      const now = Date.now();
      const endTime = spot.startedAt + (spot.durationSeconds * 1000);
      if(now > endTime) throw new Error("Spot Auction expired");

      const bidId = crypto.randomUUID();
      const bid: SpotBid = {
          id: bidId,
          spotAuctionId,
          vendorId,
          bidAmount: amount,
          bidTimestamp: now
      };

      const bids = this.spotBids.get(spotAuctionId) || [];
      bids.push(bid);
      bids.sort((a,b) => a.bidAmount - b.bidAmount);
      this.spotBids.set(spotAuctionId, bids);

      this.logEvent({
          entityType: AuditEntityType.SPOT_BID,
          entityId: bidId,
          eventType: AuditEventType.SPOT_BID_PLACED,
          triggeredBy: vendorId,
          payload: { amount, spotAuctionId }
      });
      this.notify();
  }

  // --- Phase 3A: SLA & Accountability ---

  public createPlacementSLA(contractLaneId: string, durationMinutes: number, user: string) {
      const sla: PlacementSLA = {
          id: crypto.randomUUID(),
          clientId: 'CLIENT-001',
          contractLaneId,
          slaType: 'VEHICLE_PLACEMENT',
          slaDurationMinutes: durationMinutes,
          active: true
      };
      this.placementSLAs.set(contractLaneId, sla);
      this.logEvent({
          entityType: AuditEntityType.SLA,
          entityId: sla.id,
          eventType: AuditEventType.SLA_CONFIGURED,
          triggeredBy: user,
          payload: { contractLaneId, durationMinutes }
      });
      this.notify();
  }

  public confirmVehiclePlacement(trackerId: string, user: string) {
      const tracker = this.indentTrackers.get(trackerId);
      if(!tracker) throw new Error("Tracker not found");
      if(tracker.placementStatus !== PlacementStatus.PENDING) throw new Error("Placement not pending");

      tracker.placementStatus = PlacementStatus.PLACED;
      tracker.resolvedAt = Date.now();
      
      let eventType = AuditEventType.PLACEMENT_CONFIRMED;
      // If confirmed by a spot winner, we can log specifically or just generic
      if(user.includes("SPOT")) eventType = AuditEventType.SPOT_PLACEMENT_CONFIRMED;

      this.logEvent({
          entityType: AuditEntityType.PLACEMENT_TRACKER,
          entityId: trackerId,
          eventType,
          triggeredBy: user,
          payload: { indentId: tracker.indentId, timeTaken: (tracker.resolvedAt - tracker.slaStartTime)/1000 }
      });
      this.notify();
  }

  // --- Phase 2B: Execution Simulation (Updated for SLA) ---

  public createIndent(contractLaneId: string, user: string) {
      const contractLane = this.contractLanes.get(contractLaneId);
      if(!contractLane) throw new Error("Contract Lane not found");

      const contract = this.contracts.get(contractLane.contractId);
      if(!contract) throw new Error("Contract not found");
      
      if(contract.status !== ContractStatus.ACTIVE) throw new Error(`Contract is not ACTIVE`);
      
      const now = Date.now();
      const nowStr = new Date(now).toISOString().split('T')[0];
      if(contract.endDate < nowStr) throw new Error("Contract has expired");

      const allocations = this.getContractAllocations(contractLaneId);
      if(allocations.length === 0) throw new Error("No vendor allocations found for this lane");

      // Weighted Round Robin Logic
      const history = this.indents.filter(i => i.contractLaneId === contractLaneId);
      const totalEvents = history.length;
      
      let selectedVendor = allocations[0].vendorId; 
      let maxDeficit = -Infinity;

      allocations.forEach(alloc => {
          const targetCount = (totalEvents + 1) * (alloc.allocationPercentage / 100);
          const currentCount = history.filter(h => h.selectedVendorId === alloc.vendorId).length;
          const deficit = targetCount - currentCount;

          if(deficit > maxDeficit) {
              maxDeficit = deficit;
              selectedVendor = alloc.vendorId;
          }
      });

      const rate = contractLane.baseRate; 

      const indent: Indent = {
          id: crypto.randomUUID(),
          contractId: contract.id,
          contractLaneId: contractLane.id,
          selectedVendorId: selectedVendor,
          appliedRate: rate,
          status: 'ASSIGNED', // Directly assigned for SLA testing
          createdAt: now
      };

      this.indents.unshift(indent);

      this.logEvent({
          entityType: AuditEntityType.INDENT,
          entityId: indent.id,
          eventType: AuditEventType.INDENT_CREATED,
          triggeredBy: user,
          payload: { contractLaneId, vendor: selectedVendor }
      });

      // --- SLA HOOK ---
      const sla = this.placementSLAs.get(contractLaneId);
      if (sla && sla.active) {
          const trackerId = crypto.randomUUID();
          const slaDurationMs = sla.slaDurationMinutes * 60 * 1000;
          const tracker: IndentPlacementTracker = {
              id: trackerId,
              indentId: indent.id,
              contractLaneId,
              assignedVendorId: selectedVendor,
              slaStartTime: now,
              slaEndTime: now + slaDurationMs,
              placementStatus: PlacementStatus.PENDING
          };
          this.indentTrackers.set(trackerId, tracker);
          
          // Log implicit tracker creation? Optional, kept minimal here.
      }

      this.notify();
      return indent.id;
  }


  // --- Phase 2A Actions ---

  public createContractDraftFromAuction(auctionId: string, user: string) {
      const auction = this.auctions.get(auctionId);
      if(!auction) throw new Error("Auction not found");

      // Ideally check if fully awarded, but for now allow partial
      const lanes = this.getLanesByAuction(auctionId);
      const awards = lanes.map(l => this.awards.get(l.id)).filter(a => !!a);

      if(awards.length === 0) throw new Error("No awards found for this auction. Cannot create contract.");

      const contractId = crypto.randomUUID();
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]; // +1 Year default

      const contract: TransportContract = {
          id: contractId,
          clientId: auction.clientId,
          contractType: 'AUCTION_DERIVED',
          status: ContractStatus.DRAFT,
          createdFromAuctionId: auctionId,
          startDate,
          endDate,
          createdAt: Date.now()
      };
      this.contracts.set(contractId, contract);

      // Create lanes and allocations
      lanes.forEach(lane => {
          const award = this.awards.get(lane.id);
          if(!award) return; // Skip unawarded lanes

          const clId = crypto.randomUUID();
          const cl: ContractLane = {
              id: clId,
              contractId,
              laneId: lane.id,
              laneName: lane.laneName,
              baseRate: award.price,
              effectiveFrom: startDate,
              effectiveTo: endDate,
              tatDays: lane.tatDays // Propagate TAT
          };
          this.contractLanes.set(clId, cl);

          // Default Allocation: 100% to Winner
          this.contractAllocations.push({
              id: crypto.randomUUID(),
              contractLaneId: clId,
              vendorId: award.vendorId,
              allocationPercentage: 100,
              pricingBasis: ContractPricingBasis.L1_RATE
          });
      });

      this.logEvent({
          entityType: AuditEntityType.CONTRACT,
          entityId: contractId,
          eventType: AuditEventType.CONTRACT_GENERATED,
          triggeredBy: user,
          payload: { auctionId, lanesCount: awards.length }
      });
      this.notify();
      return contractId;
  }

  public updateLaneAllocations(contractLaneId: string, allocations: {vendorId: string, percent: number}[], user: string) {
      // Validate 100%
      const total = allocations.reduce((acc, curr) => acc + curr.percent, 0);
      if(total !== 100) throw new Error(`Total allocation must be 100%. Current: ${total}%`);

      // Clear existing
      this.contractAllocations = this.contractAllocations.filter(ca => ca.contractLaneId !== contractLaneId);

      // Add new
      allocations.forEach(a => {
          this.contractAllocations.push({
              id: crypto.randomUUID(),
              contractLaneId: contractLaneId,
              vendorId: a.vendorId,
              allocationPercentage: a.percent,
              pricingBasis: ContractPricingBasis.L1_RATE // For simplicity in Phase 2A, force L1 matching
          });
      });

      this.logEvent({
          entityType: AuditEntityType.CONTRACT,
          entityId: contractLaneId, // Tracking at lane level for specificity
          eventType: AuditEventType.ALLOCATION_UPDATED,
          triggeredBy: user,
          payload: { allocations }
      });
      this.notify();
  }

  public activateContract(contractId: string, user: string) {
      const contract = this.contracts.get(contractId);
      if(!contract) throw new Error("Contract not found");
      if(contract.status !== ContractStatus.DRAFT) throw new Error("Contract is not in DRAFT state");

      contract.status = ContractStatus.ACTIVE;
      
      this.logEvent({
          entityType: AuditEntityType.CONTRACT,
          entityId: contractId,
          eventType: AuditEventType.CONTRACT_ACTIVATED,
          triggeredBy: user,
          payload: { status: 'ACTIVE' }
      });
      this.notify();
  }

  // --- Phase 1 Actions ---

  // 1. RFI
  public createRFI(title: string, description: string, deadline: number, user: string, attachments: string[] = []) {
      const id = crypto.randomUUID();
      const rfi: RFI = { id, title, description, deadline, status: RFIStatus.OPEN, createdBy: user, attachments };
      this.rfis.set(id, rfi);
      this.logEvent({ entityType: AuditEntityType.RFI, entityId: id, eventType: AuditEventType.CREATED, triggeredBy: user, payload: { title, attachments } });
      this.notify();
      return id;
  }

  public recordVendorInterest(rfiId: string, vendorId: string, interested: boolean, notes: string) {
      this.vendorInterests.push({ rfiId, vendorId, interested, notes });
      this.notify();
  }

  // 2. RFQ
  public createRFQ(name: string, rfiId: string | undefined, user: string) {
      const id = crypto.randomUUID();
      const rfq: RFQ = { id, rfiId, name, status: RFQStatus.DRAFT, createdBy: user };
      this.rfqs.set(id, rfq);
      this.logEvent({ entityType: AuditEntityType.RFQ, entityId: id, eventType: AuditEventType.CREATED, triggeredBy: user, payload: { name, rfiId } });
      this.notify();
      return id;
  }

  public addRFQLane(rfqId: string, laneData: Omit<RFQLane, 'id' | 'rfqId'>) {
      const id = crypto.randomUUID();
      this.rfqLanes.set(id, { id, rfqId, ...laneData });
      this.notify();
  }

  public sendRFQ(rfqId: string, user: string) {
      const rfq = this.rfqs.get(rfqId);
      if(rfq) {
          rfq.status = RFQStatus.SENT;
          this.logEvent({ entityType: AuditEntityType.RFQ, entityId: rfqId, eventType: AuditEventType.STATUS_CHANGE, triggeredBy: user, payload: { status: 'SENT' } });
          this.notify();
      }
  }

  public submitQuote(rfqLaneId: string, vendorId: string, price: number, participating: boolean) {
      // Upsert
      const existing = this.vendorQuotes.findIndex(q => q.rfqLaneId === rfqLaneId && q.vendorId === vendorId);
      if(existing >= 0) {
          this.vendorQuotes[existing] = { rfqLaneId, vendorId, price, participating };
      } else {
          this.vendorQuotes.push({ rfqLaneId, vendorId, price, participating });
      }
      this.notify();
  }

  public createAuctionFromRFQ(rfqId: string, ruleset: Omit<AuctionRuleset, 'id'>, user: string) {
      const rfq = this.rfqs.get(rfqId);
      if(!rfq) throw new Error("RFQ not found");
      
      const rfqLanes = this.getRFQLanes(rfqId);
      const lanes: CreateAuctionRequest['lanes'] = rfqLanes.map((rl, idx) => {
          // Determine base price: Lowest quote or a default high number if no quotes
          const quotes = this.getVendorQuotes(rl.id).filter(q => q.participating && q.price > 0);
          const minQuote = quotes.length > 0 ? Math.min(...quotes.map(q => q.price)) : 100000;
          
          return {
              laneName: rl.laneName,
              sequenceOrder: idx + 1,
              basePrice: minQuote, // Start auction at lowest RFQ quote
              minBidDecrement: ruleset.minBidDecrement,
              timerDurationSeconds: 300, // Default 5 mins
              // Phase 1 Extra Data
              truckType: rl.truckType,
              capacity: rl.capacity,
              estMonthlyVolume: rl.estMonthlyVolume,
              tatDays: rl.tatDays // Propagate TAT
          };
      });

      const req: CreateAuctionRequest = {
          name: `Auction: ${rfq.name}`,
          auctionType: AuctionType.REVERSE,
          clientId: 'ENTERPRISE-01',
          createdBy: user,
          ruleset,
          lanes
      };

      const auctionId = this.createAuction(req);
      
      // Link back
      const auction = this.auctions.get(auctionId);
      if(auction) auction.originRFQId = rfqId;

      // Lock RFQ
      rfq.status = RFQStatus.LOCKED;
      
      this.logEvent({ entityType: AuditEntityType.RFQ, entityId: rfqId, eventType: AuditEventType.STATUS_CHANGE, triggeredBy: user, payload: { status: 'LOCKED', auctionId } });
      
      return auctionId;
  }

  public awardLane(laneId: string, vendorId: string, price: number, rank: number, reason: string, user: string) {
      const lane = this.lanes.get(laneId);
      if(!lane) throw new Error("Lane not found");
      
      // Allow awarding if Closed OR if manual override
      lane.status = LaneStatus.AWARDED;
      this.awards.set(laneId, {
          auctionLaneId: laneId,
          vendorId,
          price,
          rank,
          reason,
          awardedAt: Date.now(),
          awardedBy: user
      });

      this.logEvent({
          entityType: AuditEntityType.AWARD,
          entityId: laneId,
          eventType: AuditEventType.AWARDED,
          triggeredBy: user,
          payload: { vendorId, price, rank, reason }
      });
      this.notify();
  }

  // --- Helpers ---
  public getVendorRank(laneId: string, vendorId: string): number | null {
      const bids = this.getBidsByLane(laneId);
      // Group by vendor, take best bid
      const bestBids = new Map<string, number>();
      bids.forEach(b => {
          const existing = bestBids.get(b.vendorId);
          if(!existing || b.bidAmount < existing) {
              bestBids.set(b.vendorId, b.bidAmount);
          }
      });

      const sorted = Array.from(bestBids.entries()).sort((a, b) => a[1] - b[1]);
      const rankIdx = sorted.findIndex(s => s[0] === vendorId);
      
      return rankIdx >= 0 ? rankIdx + 1 : null;
  }

  // --- Phase 0 Core Actions ---

  public createAuction(req: CreateAuctionRequest) {
    const auctionId = crypto.randomUUID();
    const rulesetId = crypto.randomUUID();

    const ruleset: AuctionRuleset = { id: rulesetId, ...req.ruleset };
    this.rulesets.set(rulesetId, ruleset);

    const auction: Auction = {
      id: auctionId,
      name: req.name,
      auctionType: req.auctionType,
      status: AuctionStatus.DRAFT,
      createdBy: req.createdBy,
      clientId: req.clientId,
      rulesetId: rulesetId,
      createdAt: Date.now(),
    };
    this.auctions.set(auctionId, auction);

    this.logEvent({
      entityType: AuditEntityType.AUCTION,
      entityId: auctionId,
      eventType: AuditEventType.CREATED,
      triggeredBy: req.createdBy,
      payload: { name: req.name, type: req.auctionType },
    });

    req.lanes.forEach((laneDraft) => {
      const laneId = crypto.randomUUID();
      // @ts-ignore - handling phase 1 props spread safely
      const lane: AuctionLane = {
        id: laneId,
        auctionId: auctionId,
        status: LaneStatus.PENDING,
        ...laneDraft
      };
      this.lanes.set(laneId, lane);
      this.bids.set(laneId, []);

      this.logEvent({
        entityType: AuditEntityType.LANE,
        entityId: laneId,
        eventType: AuditEventType.CREATED,
        triggeredBy: req.createdBy,
        payload: { laneName: lane.laneName, basePrice: lane.basePrice },
      });
    });

    this.notify();
    return auctionId;
  }

  public publishAuction(auctionId: string, userId: string) {
    const auction = this.auctions.get(auctionId);
    if (!auction) throw new Error('Auction not found');
    if (auction.status !== AuctionStatus.DRAFT) throw new Error('Auction must be DRAFT to publish');

    auction.status = AuctionStatus.PUBLISHED;
    
    this.logEvent({
      entityType: AuditEntityType.AUCTION,
      entityId: auctionId,
      eventType: AuditEventType.STATUS_CHANGE,
      triggeredBy: userId,
      payload: { oldStatus: 'DRAFT', newStatus: 'PUBLISHED' },
    });

    this.notify();
  }

  public startLane(laneId: string, userId: string) {
    const lane = this.lanes.get(laneId);
    if (!lane) throw new Error('Lane not found');
    const auction = this.auctions.get(lane.auctionId);
    if (!auction) throw new Error('Parent auction not found');

    if (auction.status !== AuctionStatus.RUNNING) {
      if (auction.status === AuctionStatus.DRAFT) throw new Error("Cannot start lane when auction is DRAFT. Publish it first.");
      auction.status = AuctionStatus.RUNNING;
      this.logEvent({ entityType: AuditEntityType.AUCTION, entityId: auction.id, eventType: AuditEventType.STATUS_CHANGE, triggeredBy: userId, payload: { newStatus: 'RUNNING' } });
    }

    if (lane.status !== LaneStatus.PENDING) throw new Error('Lane is not PENDING');

    const now = Date.now();
    lane.status = LaneStatus.RUNNING;
    lane.startTime = now;
    lane.endTime = now + (lane.timerDurationSeconds * 1000);

    this.logEvent({ entityType: AuditEntityType.LANE, entityId: laneId, eventType: AuditEventType.STATUS_CHANGE, triggeredBy: userId, payload: { status: 'RUNNING', startTime: lane.startTime, endTime: lane.endTime } });
    this.notify();
  }

  public forceCloseLane(laneId: string, userId: string) {
    const lane = this.lanes.get(laneId);
    if (!lane) throw new Error('Lane not found');
    if (lane.status !== LaneStatus.RUNNING) throw new Error('Lane is not RUNNING');
    lane.status = LaneStatus.CLOSED;
    lane.endTime = Date.now();
    this.logEvent({ entityType: AuditEntityType.LANE, entityId: laneId, eventType: AuditEventType.STATUS_CHANGE, triggeredBy: userId, payload: { status: 'CLOSED', reason: 'Manual Override' } });
    this.notify();
  }

  public placeBid(laneId: string, vendorId: string, amount: number) {
    const lane = this.lanes.get(laneId);
    if (!lane) throw new Error('Lane not found');
    if (lane.status !== LaneStatus.RUNNING) throw new Error('Lane is not RUNNING');
    
    const now = Date.now();
    if (lane.endTime && now > lane.endTime) throw new Error('Lane timer expired');

    const currentBids = this.bids.get(laneId) || [];
    const currentLowest = currentBids.length > 0 ? currentBids[0].bidAmount : lane.basePrice;
    const maxAllowedBid = currentLowest - lane.minBidDecrement;

    if (amount > maxAllowedBid) throw new Error(`Bid invalid. Must be <= ${maxAllowedBid}`);

    const bid: Bid = { id: crypto.randomUUID(), auctionLaneId: laneId, vendorId, bidAmount: amount, bidTimestamp: now, isValid: true };

    currentBids.push(bid);
    currentBids.sort((a, b) => a.bidAmount - b.bidAmount);
    this.bids.set(laneId, currentBids);

    lane.currentLowestBid = amount;

    this.logEvent({ entityType: AuditEntityType.BID, entityId: bid.id, eventType: AuditEventType.BID_PLACED, triggeredBy: vendorId, payload: { amount, laneId } });

    const auction = this.auctions.get(lane.auctionId);
    const ruleset = this.rulesets.get(auction!.rulesetId);
    
    if (lane.endTime && ruleset) {
        const timeRemainingMs = lane.endTime - now;
        const thresholdMs = ruleset.timerExtensionThresholdSeconds * 1000;
        if (timeRemainingMs <= thresholdMs) {
            const extensionMs = ruleset.timerExtensionSeconds * 1000;
            const oldEndTime = lane.endTime;
            lane.endTime = now + extensionMs;
            this.logEvent({ entityType: AuditEntityType.LANE, entityId: laneId, eventType: AuditEventType.TIMER_EXTENDED, triggeredBy: 'SYSTEM', payload: { oldEndTime, newEndTime: lane.endTime, reason: 'Sniper Protection' } });
        }
    }
    this.notify();
  }

  private tick() {
    const now = Date.now();
    let changed = false;

    // Phase 0: Auction Timer
    for (const lane of this.lanes.values()) {
      if (lane.status === LaneStatus.RUNNING && lane.endTime && now >= lane.endTime) {
        lane.status = LaneStatus.CLOSED;
        this.logEvent({ entityType: AuditEntityType.LANE, entityId: lane.id, eventType: AuditEventType.STATUS_CHANGE, triggeredBy: 'SYSTEM', payload: { status: 'CLOSED', reason: 'Timer Expired' } });
        changed = true;
      }
    }

    // Phase 3A: SLA Timer
    for (const tracker of this.indentTrackers.values()) {
        if(tracker.placementStatus === PlacementStatus.PENDING && now > tracker.slaEndTime) {
            tracker.placementStatus = PlacementStatus.FAILED;
            tracker.resolvedAt = now;
            this.logEvent({
                entityType: AuditEntityType.PLACEMENT_TRACKER,
                entityId: tracker.id,
                eventType: AuditEventType.SLA_BREACHED,
                triggeredBy: 'SYSTEM',
                payload: { indentId: tracker.indentId, breachTime: new Date(now).toISOString() }
            });
            // Phase 3B Trigger
            this.triggerSpotAuction(tracker.indentId);
            changed = true;
        }
    }

    // Phase 3B: Spot Auction Timer
    for (const spot of this.spotAuctions.values()) {
        if(spot.status === SpotAuctionStatus.RUNNING) {
            const endTime = spot.startedAt + (spot.durationSeconds * 1000);
            if(now > endTime) {
                spot.status = SpotAuctionStatus.COMPLETED;
                
                // Determine Winner
                const bids = this.spotBids.get(spot.id) || [];
                // Already sorted ascending in placeSpotBid
                const winner = bids.length > 0 ? bids[0] : null;

                if(winner) {
                    spot.winningBidId = winner.id;
                    spot.winningVendorId = winner.vendorId;
                    spot.winningAmount = winner.bidAmount;

                    // Update Indent
                    const indent = this.indents.find(i => i.id === spot.indentId);
                    if(indent) {
                        indent.status = 'REASSIGNED';
                        indent.selectedVendorId = winner.vendorId;
                        indent.appliedRate = winner.bidAmount;

                        // Create new tracker for the Spot Winner to Confirm
                        const trackerId = crypto.randomUUID();
                        // 1 hour for spot placement confirmation default
                        const slaDurationMs = 60 * 60 * 1000; 
                        
                        const tracker: IndentPlacementTracker = {
                            id: trackerId,
                            indentId: indent.id,
                            contractLaneId: indent.contractLaneId,
                            assignedVendorId: winner.vendorId,
                            slaStartTime: now,
                            slaEndTime: now + slaDurationMs,
                            placementStatus: PlacementStatus.PENDING
                        };
                        this.indentTrackers.set(trackerId, tracker);
                    }

                    this.logEvent({
                        entityType: AuditEntityType.SPOT_AUCTION,
                        entityId: spot.id,
                        eventType: AuditEventType.SPOT_AWARDED,
                        triggeredBy: 'SYSTEM',
                        payload: { winner: winner.vendorId, amount: winner.bidAmount }
                    });
                } else {
                     this.logEvent({
                        entityType: AuditEntityType.SPOT_AUCTION,
                        entityId: spot.id,
                        eventType: AuditEventType.SPOT_CLOSED,
                        triggeredBy: 'SYSTEM',
                        payload: { reason: 'NO_BIDS' }
                    });
                }
                changed = true;
            }
        }
    }

    if (changed) this.notify();
  }

  private logEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>) {
    const fullEvent: AuditEvent = { id: crypto.randomUUID(), createdAt: Date.now(), ...event };
    this.auditLog.unshift(fullEvent);
  }

  private notify() { this.subscribers.forEach(cb => cb()); }

  private seedData() { 
      // Optional: seed generic rules
  }
}

export const auctionEngine = new AuctionEngine();
