# 9. Extending the System - Dojo Game Starter

## 🎯 Extension Philosophy

The Dojo Game Starter is designed as a **foundation**, not a complete game. Train/Mine/Rest are **primitives** that demonstrate core patterns. Your job is to build upon them, not replace them.

**Think Building Blocks**: Each component connects cleanly with others, allowing complex features while maintaining stability.

---

## 🏗️ The Three-Layer Extension Pattern

Every extension follows the same pattern across three layers:

**1. Cairo Contracts** (Game Rules)
- Define what players can do
- Establish costs and rewards
- Create verifiable game state

**2. React Hooks** (Data Flow)  
- Handle blockchain interactions
- Manage optimistic updates
- Coordinate multi-step operations

**3. React Components** (User Interface)
- Transform data into engaging visuals
- Follow established design patterns
- Maintain consistent UX

---

## 🎮 Extension Strategies

### **Start With Player Choices**

Ask: "What meaningful decisions do I want players to make?"

The starter gives you three choice types:
- **Pure advancement** (Train - risk-free growth)
- **Risk/reward** (Mine - gain coins, lose health)  
- **Resource management** (Rest - recover health)

Add new choice types:
- **Strategic**: Long-term vs. immediate gains
- **Social**: Cooperation vs. competition  
- **Economic**: Investment and trading
- **Creative**: Building and customization

### **The Expansion Phases**

**Phase 1: Mirror Extensions**
- Train → Train Strength/Magic/Stealth
- Mine → Mine Gold/Gems/Materials
- Rest → Rest at Inn/Nature/Temple

**Phase 2: Combination Extensions**
- Craft (mining + training)
- Quest (multiple actions in sequence)
- Trade (resources + social interaction)

**Phase 3: New Systems**
- Combat (health becomes HP)
- Exploration (movement + discovery)
- Social (guilds, teams, competition)

---

## 🧠 Design Principles

### **Preserve the Core Loop**
**Player Intent → Action → Immediate Feedback → Updated State**

Every extension must maintain this instant feedback cycle.

### **Smart Constraints**
Good games come from meaningful limitations, not unlimited freedom.

**Examples**:
- Limited inventory slots (capacity decisions)
- Skill tree branches (specialization choices)  
- Time-based resources (scheduling decisions)

### **Emergent Complexity**
Simple systems that interact create rich experiences.

Example: Add item durability → Mining suddenly becomes equipment management → Strategic depth emerges naturally.

---

## 🛠️ Development Approach

### **Minimum Viable Game (MVG)**

Build the smallest complete game that demonstrates your vision:

**RPG MVG**: Add classes where wizards get more EXP from training, warriors get more coins from mining, healers recover more health from resting.

**Strategy MVG**: Add territory control where mining claims cost coins but generate passive income.

**Social MVG**: Add teams where players share resources and combine efforts.

### **Testing Questions**

Every extension should pass these tests:
1. **Does it make existing choices more interesting?**
2. **Does it create new meaningful decisions?**
3. **Does it maintain the core game flow?**

---

## 📊 Feature Priority Guide

**Tier 1: Core Mechanics** (High Impact, Moderate Effort)
- Enhanced progression systems
- Resource management mechanics
- Risk/reward variations

**Tier 2: Social Features** (High Impact, High Effort)
- Guilds and teams
- Competitive systems
- Trading mechanics

**Tier 3: Content Systems** (Moderate Impact, High Effort)
- Procedural generation
- Quests and achievements
- World-building tools

**Tier 4: Polish Features** (Low Impact, Low effort)
- UI improvements
- Visual effects
- Quality-of-life features

---

## 🚀 Success Metrics

Focus on engagement metrics that matter for onchain games:

- **Player Return Rate**: Do they come back daily?
- **Action Diversity**: Do they use all systems or optimize one path?  
- **Emergent Behavior**: Are they discovering unintended strategies?
- **Community Formation**: Are players naturally forming groups?
- **Economic Health**: Are resources flowing sustainably?

---

## ⚡ Quick Start Guide

1. **Pick one existing action** (Train/Mine/Rest)
2. **Create a variation** that serves your game vision
3. **Test with real players** immediately
4. **Observe emergent behaviors** 
5. **Build the next piece** based on learnings

**Remember**: Great onchain games evolve through iteration and community feedback. Start small, test early, build incrementally.

The starter gets you from zero to playable in minutes. Where you take it next is up to your vision and player feedback.