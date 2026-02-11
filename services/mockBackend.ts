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
  AuctionDraft,
  DraftStatus,
  SaveDraftRequest,
  AuctionTemplate,
  TemplateCategory,
  TemplateVisibility,
  CreateTemplateRequest,
  UpdateTemplateRequest,
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

  // Draft Stores
  private drafts: Map<string, AuctionDraft> = new Map();

  // Template Stores
  private templates: Map<string, AuctionTemplate> = new Map();

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
      drafts: Array.from(this.drafts.values()),
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
  
  // Draft Getters
  public getDraft(draftId: string) { return this.drafts.get(draftId); }
  public getAllDrafts() { 
    return Array.from(this.drafts.values()).sort((a, b) => b.lastModifiedAt - a.lastModifiedAt);
  }
  public getDraftsByUser(userId: string) {
    return Array.from(this.drafts.values())
      .filter(d => d.createdBy === userId)
      .sort((a, b) => b.lastModifiedAt - a.lastModifiedAt);
  }
  
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

  // --- Draft Management ---

  private generateDraftId(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `DRAFT-${date}-${random}`;
  }

  public saveDraft(req: SaveDraftRequest): string {
    const draftId = this.generateDraftId();
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const draft: AuctionDraft = {
      draftId,
      auctionData: req.auctionData,
      createdBy: req.createdBy,
      createdAt: now,
      lastModifiedAt: now,
      status: DraftStatus.INCOMPLETE,
      expiresAt: now + thirtyDaysMs,
    };

    this.drafts.set(draftId, draft);
    this.notify();
    return draftId;
  }

  public updateDraft(draftId: string, auctionData: AuctionDraft['auctionData']): void {
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error('Draft not found');

    draft.auctionData = auctionData;
    draft.lastModifiedAt = Date.now();

    // Update status based on completeness
    const isReady = auctionData.name.trim().length > 0 && auctionData.lanes.length > 0;
    draft.status = isReady ? DraftStatus.READY : DraftStatus.INCOMPLETE;

    this.drafts.set(draftId, draft);
    this.notify();
  }

  public deleteDraft(draftId: string): void {
    if (!this.drafts.has(draftId)) throw new Error('Draft not found');
    this.drafts.delete(draftId);
    this.notify();
  }

  public duplicateDraft(draftId: string): string {
    const original = this.drafts.get(draftId);
    if (!original) throw new Error('Draft not found');

    const newDraftId = this.generateDraftId();
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const newDraft: AuctionDraft = {
      draftId: newDraftId,
      auctionData: JSON.parse(JSON.stringify(original.auctionData)), // Deep copy
      createdBy: original.createdBy,
      createdAt: now,
      lastModifiedAt: now,
      status: original.status,
      expiresAt: now + thirtyDaysMs,
    };

    this.drafts.set(newDraftId, newDraft);
    this.notify();
    return newDraftId;
  }

  public publishDraft(draftId: string, userId: string): string {
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error('Draft not found');

    // Create auction from draft
    const createAuctionReq: CreateAuctionRequest = {
      name: draft.auctionData.name,
      auctionType: draft.auctionData.auctionType,
      clientId: 'CLIENT-001', // Default
      createdBy: userId,
      ruleset: draft.auctionData.globalRuleset,
      lanes: draft.auctionData.lanes.map(l => ({
        laneName: l.laneName,
        sequenceOrder: draft.auctionData.lanes.indexOf(l) + 1,
        basePrice: l.basePrice,
        minBidDecrement: l.decrement,
        timerDurationSeconds: l.duration,
        tatDays: l.tatDays,
      })),
    };

    // Create the auction using existing createAuction method
    const auctionId = this.createAuction(createAuctionReq);

    // Delete the draft
    this.drafts.delete(draftId);
    this.notify();

    return auctionId;
  }

  // --- Template Management ---

  public createTemplate(req: CreateTemplateRequest): string {
    const templateId = this.generateTemplateId();
    const now = Date.now();

    const template: AuctionTemplate = {
      templateId,
      templateName: req.templateName,
      description: req.description,
      category: req.category,
      isSystemTemplate: false,
      visibility: req.visibility,
      isFavorite: req.isFavorite || false,
      auctionConfiguration: req.auctionConfiguration,
      createdBy: req.createdBy,
      createdAt: now,
      lastModifiedAt: now,
      usageCount: 0,
      totalAuctionsCreated: 0,
    };

    this.templates.set(templateId, template);
    this.notify();
    return templateId;
  }

  public getTemplate(templateId: string): AuctionTemplate | undefined {
    return this.templates.get(templateId);
  }

  public getAllTemplates(): AuctionTemplate[] {
    return Array.from(this.templates.values()).filter(t => !t.isDeleted);
  }

  public getTemplatesByUser(userId: string): AuctionTemplate[] {
    return Array.from(this.templates.values()).filter(
      t => !t.isDeleted && t.createdBy === userId
    );
  }

  public updateTemplate(templateId: string, req: UpdateTemplateRequest): void {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');
    if (template.isSystemTemplate) throw new Error('Cannot modify system templates');

    if (req.templateName) template.templateName = req.templateName;
    if (req.description !== undefined) template.description = req.description;
    if (req.category) template.category = req.category;
    if (req.visibility) template.visibility = req.visibility;
    if (req.isFavorite !== undefined) template.isFavorite = req.isFavorite;
    if (req.auctionConfiguration) template.auctionConfiguration = req.auctionConfiguration;

    template.lastModifiedAt = Date.now();
    template.lastModifiedBy = req.lastModifiedBy;

    this.templates.set(templateId, template);
    this.notify();
  }

  public deleteTemplate(templateId: string): void {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');
    if (template.isSystemTemplate) throw new Error('Cannot delete system templates');

    // Soft delete
    template.isDeleted = true;
    template.deletedAt = Date.now();

    this.templates.set(templateId, template);
    this.notify();
  }

  public duplicateTemplate(templateId: string, userId: string): string {
    const original = this.templates.get(templateId);
    if (!original) throw new Error('Template not found');

    const newTemplateId = this.generateTemplateId();
    const now = Date.now();

    const newTemplate: AuctionTemplate = {
      templateId: newTemplateId,
      templateName: `${original.templateName} - Copy`,
      description: original.description,
      category: original.category,
      isSystemTemplate: false,
      visibility: original.visibility,
      isFavorite: false,
      auctionConfiguration: JSON.parse(JSON.stringify(original.auctionConfiguration)), // Deep copy
      createdBy: userId,
      createdAt: now,
      lastModifiedAt: now,
      lastModifiedBy: userId,
      usageCount: 0,
      totalAuctionsCreated: 0,
    };

    this.templates.set(newTemplateId, newTemplate);
    this.notify();
    return newTemplateId;
  }

  public toggleFavorite(templateId: string): void {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    template.isFavorite = !template.isFavorite;
    template.lastModifiedAt = Date.now();

    this.templates.set(templateId, template);
    this.notify();
  }

  public recordTemplateUsage(templateId: string, userId: string): void {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    template.usageCount = (template.usageCount || 0) + 1;
    template.lastUsedAt = Date.now();
    template.totalAuctionsCreated = (template.totalAuctionsCreated || 0) + 1;

    // Track most used by
    if (!template.mostUsedBy || template.mostUsedBy === userId) {
      template.mostUsedBy = userId;
      template.mostUsedByCount = (template.mostUsedByCount || 0) + 1;
    }

    this.templates.set(templateId, template);
    this.notify();
  }

  private generateTemplateId(): string {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `TMPL-${timestamp}-${random}`;
  }

  private cleanupExpiredDrafts(): void {
    const now = Date.now();
    const expiredDrafts: string[] = [];

    for (const [draftId, draft] of this.drafts.entries()) {
      if (now > draft.expiresAt) {
        expiredDrafts.push(draftId);
      }
    }

    expiredDrafts.forEach(draftId => this.drafts.delete(draftId));

    if (expiredDrafts.length > 0) {
      console.log(`Cleaned up ${expiredDrafts.length} expired drafts`);
      this.notify();
    }
  }

  private tick() {
    this.cleanupExpiredDrafts();
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
    this.initializeSystemTemplates();
  }

  private initializeSystemTemplates(): void {
    const now = Date.now();
    const systemTemplates: AuctionTemplate[] = [
      {
        templateId: 'TMPL-SYS-001',
        templateName: 'Regional FTL - North India',
        description: 'Full Truckload auctions optimized for North India routes with standard FTL settings',
        category: TemplateCategory.FTL,
        isSystemTemplate: true,
        visibility: TemplateVisibility.ORGANIZATION,
        isFavorite: false,
        auctionConfiguration: {
          auctionType: AuctionType.REVERSE,
          globalRuleset: {
            minBidDecrement: 500,
            timerExtensionThresholdSeconds: 15,
            timerExtensionSeconds: 180,
            allowRankVisibility: true,
          },
          lanes: [
            { laneName: 'Delhi-Mumbai', basePrice: 85000, duration: 600, decrement: 1000, tatDays: 4 },
            { laneName: 'Delhi-Jaipur', basePrice: 15000, duration: 300, decrement: 300, tatDays: 1 },
            { laneName: 'Delhi-Chandigarh', basePrice: 8000, duration: 180, decrement: 200, tatDays: 1 },
            { laneName: 'Delhi-Lucknow', basePrice: 25000, duration: 300, decrement: 500, tatDays: 2 },
            { laneName: 'Delhi-Kolkata', basePrice: 95000, duration: 900, decrement: 1200, tatDays: 5 },
          ],
        },
        createdBy: 'SYSTEM',
        createdAt: now,
        lastModifiedAt: now,
        usageCount: 0,
      },
      {
        templateId: 'TMPL-SYS-002',
        templateName: 'Last Mile Delivery - Metro Cities',
        description: 'LOT auctions for last-mile delivery with shorter durations and aggressive decrements',
        category: TemplateCategory.LTL,
        isSystemTemplate: true,
        visibility: TemplateVisibility.ORGANIZATION,
        isFavorite: false,
        auctionConfiguration: {
          auctionType: AuctionType.LOT,
          globalRuleset: {
            minBidDecrement: 50,
            timerExtensionThresholdSeconds: 8,
            timerExtensionSeconds: 60,
            allowRankVisibility: false,
          },
          lanes: [
            { laneName: 'Mumbai Zone 1', basePrice: 5000, duration: 120, decrement: 100, tatDays: 0 },
            { laneName: 'Mumbai Zone 2', basePrice: 4500, duration: 120, decrement: 100, tatDays: 0 },
            { laneName: 'Delhi Zone 1', basePrice: 4000, duration: 120, decrement: 80, tatDays: 0 },
            { laneName: 'Bangalore Zone 1', basePrice: 3500, duration: 120, decrement: 70, tatDays: 0 },
            { laneName: 'Hyderabad Zone 1', basePrice: 3000, duration: 120, decrement: 60, tatDays: 0 },
          ],
        },
        createdBy: 'SYSTEM',
        createdAt: now,
        lastModifiedAt: now,
        usageCount: 0,
      },
      {
        templateId: 'TMPL-SYS-003',
        templateName: 'Spot Auction - Urgent Loads',
        description: 'Quick SPOT auctions for urgent shipments with very short duration and high decrements',
        category: TemplateCategory.SPOT,
        isSystemTemplate: true,
        visibility: TemplateVisibility.ORGANIZATION,
        isFavorite: false,
        auctionConfiguration: {
          auctionType: AuctionType.SPOT,
          globalRuleset: {
            minBidDecrement: 1000,
            timerExtensionThresholdSeconds: 5,
            timerExtensionSeconds: 30,
            allowRankVisibility: false,
          },
          lanes: [
            { laneName: 'Urgent - Immediate', basePrice: 50000, duration: 180, decrement: 2000, tatDays: 0 },
            { laneName: 'Urgent - 2 Hours', basePrice: 40000, duration: 240, decrement: 1500, tatDays: 0 },
            { laneName: 'Urgent - 4 Hours', basePrice: 35000, duration: 300, decrement: 1000, tatDays: 0 },
          ],
        },
        createdBy: 'SYSTEM',
        createdAt: now,
        lastModifiedAt: now,
        usageCount: 0,
      },
      {
        templateId: 'TMPL-SYS-004',
        templateName: 'Quarterly Contract - Pan India',
        description: 'BULK auctions for quarterly contracts with major Pan India lanes',
        category: TemplateCategory.FTL,
        isSystemTemplate: true,
        visibility: TemplateVisibility.ORGANIZATION,
        isFavorite: false,
        auctionConfiguration: {
          auctionType: AuctionType.BULK,
          globalRuleset: {
            minBidDecrement: 2000,
            timerExtensionThresholdSeconds: 20,
            timerExtensionSeconds: 300,
            allowRankVisibility: true,
          },
          lanes: [
            { laneName: 'Delhi-Mumbai', basePrice: 80000, duration: 1200, decrement: 1500, tatDays: 4 },
            { laneName: 'Delhi-Bangalore', basePrice: 120000, duration: 1200, decrement: 2000, tatDays: 5 },
            { laneName: 'Delhi-Chennai', basePrice: 150000, duration: 1200, decrement: 2500, tatDays: 6 },
            { laneName: 'Delhi-Kolkata', basePrice: 90000, duration: 1200, decrement: 1500, tatDays: 5 },
            { laneName: 'Chennai-Mumbai', basePrice: 95000, duration: 1200, decrement: 1500, tatDays: 4 },
          ],
        },
        createdBy: 'SYSTEM',
        createdAt: now,
        lastModifiedAt: now,
        usageCount: 0,
      },
      {
        templateId: 'TMPL-SYS-005',
        templateName: 'Regional LTL - West Zone',
        description: 'Regional LTL routes in West India with multiple pickup/drop points',
        category: TemplateCategory.REGIONAL,
        isSystemTemplate: true,
        visibility: TemplateVisibility.ORGANIZATION,
        isFavorite: false,
        auctionConfiguration: {
          auctionType: AuctionType.REGION_LOT,
          globalRuleset: {
            minBidDecrement: 300,
            timerExtensionThresholdSeconds: 12,
            timerExtensionSeconds: 120,
            allowRankVisibility: true,
          },
          lanes: [
            { laneName: 'Ahmedabad-Indore', basePrice: 18000, duration: 300, decrement: 300, tatDays: 2 },
            { laneName: 'Mumbai-Pune', basePrice: 12000, duration: 240, decrement: 250, tatDays: 1 },
            { laneName: 'Surat-Vapi', basePrice: 8000, duration: 180, decrement: 150, tatDays: 1 },
            { laneName: 'Rajkot-Ahmedabad', basePrice: 15000, duration: 240, decrement: 300, tatDays: 1 },
          ],
        },
        createdBy: 'SYSTEM',
        createdAt: now,
        lastModifiedAt: now,
        usageCount: 0,
      },
      {
        templateId: 'TMPL-SYS-006',
        templateName: 'High-Value Specialty - Express',
        description: 'Reverse auction for high-value specialty goods with express delivery requirement',
        category: TemplateCategory.FTL,
        isSystemTemplate: true,
        visibility: TemplateVisibility.ORGANIZATION,
        isFavorite: false,
        auctionConfiguration: {
          auctionType: AuctionType.REVERSE,
          globalRuleset: {
            minBidDecrement: 3000,
            timerExtensionThresholdSeconds: 15,
            timerExtensionSeconds: 180,
            allowRankVisibility: true,
          },
          lanes: [
            { laneName: 'Mumbai-Delhi (Express)', basePrice: 200000, duration: 800, decrement: 5000, tatDays: 2 },
            { laneName: 'Delhi-Bangalore (Express)', basePrice: 250000, duration: 800, decrement: 5000, tatDays: 2 },
            { laneName: 'Chennai-Kolkata (Express)', basePrice: 280000, duration: 900, decrement: 6000, tatDays: 3 },
          ],
        },
        createdBy: 'SYSTEM',
        createdAt: now,
        lastModifiedAt: now,
        usageCount: 0,
      },
      {
        templateId: 'TMPL-SYS-007',
        templateName: 'Partial Load - Regional Network',
        description: 'LOT auction for partial loads connecting regional hubs',
        category: TemplateCategory.LTL,
        isSystemTemplate: true,
        visibility: TemplateVisibility.ORGANIZATION,
        isFavorite: false,
        auctionConfiguration: {
          auctionType: AuctionType.LOT,
          globalRuleset: {
            minBidDecrement: 100,
            timerExtensionThresholdSeconds: 8,
            timerExtensionSeconds: 90,
            allowRankVisibility: false,
          },
          lanes: [
            { laneName: 'Hub-A to Hub-B', basePrice: 8000, duration: 180, decrement: 150, tatDays: 1 },
            { laneName: 'Hub-B to Hub-C', basePrice: 7500, duration: 180, decrement: 150, tatDays: 1 },
            { laneName: 'Hub-C to Hub-A', basePrice: 9000, duration: 180, decrement: 180, tatDays: 1 },
            { laneName: 'Hub-A to Satellite', basePrice: 5000, duration: 120, decrement: 100, tatDays: 0 },
          ],
        },
        createdBy: 'SYSTEM',
        createdAt: now,
        lastModifiedAt: now,
        usageCount: 0,
      },
      {
        templateId: 'TMPL-SYS-008',
        templateName: 'Cold Chain Distribution',
        description: 'Specialized REVERSE auction for temperature-controlled logistics',
        category: TemplateCategory.FTL,
        isSystemTemplate: true,
        visibility: TemplateVisibility.ORGANIZATION,
        isFavorite: false,
        auctionConfiguration: {
          auctionType: AuctionType.REVERSE,
          globalRuleset: {
            minBidDecrement: 1000,
            timerExtensionThresholdSeconds: 10,
            timerExtensionSeconds: 150,
            allowRankVisibility: true,
          },
          lanes: [
            { laneName: 'Delhi-Mumbai (Cold)', basePrice: 120000, duration: 900, decrement: 2000, tatDays: 2 },
            { laneName: 'Mumbai-Bangalore (Cold)', basePrice: 95000, duration: 900, decrement: 1500, tatDays: 2 },
          ],
        },
        createdBy: 'SYSTEM',
        createdAt: now,
        lastModifiedAt: now,
        usageCount: 0,
      },
    ];

    systemTemplates.forEach(template => {
      this.templates.set(template.templateId, template);
    });
  }
}

export const auctionEngine = new AuctionEngine();
