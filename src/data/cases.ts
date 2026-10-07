export type CaseKey = 'atlas' | 'fieldnote' | 'threshold';
export interface Decision { title: string; observation: string; choice: string; effect: string; }
export interface CaseStudy { name: string; label: string; headline: string; description: string; services: string[]; color: string; before: string[]; after: string[]; decisions: Decision[]; artifacts: { title: string; note: string; items: string[] }[]; }
/** All artifacts and decisions are concept design work, not client research or measured results. */
export const cases: Record<CaseKey, CaseStudy> = {
  atlas: {
    name: 'Atlas', label: 'Workflow & decision design', headline: 'Less searching. More deciding.',
    description: 'An operations concept that groups seven competing actions into four stages, with context at the point of decision.',
    services: ['strategy','web'], color: '#44676b',
    before: ['Open request','Check details','Find owner','Choose priority','Check capacity','Confirm assignment','Send update'],
    after: ['Understand the request','Set the priority','Assign with context','Review & send'],
    decisions: [
      {title:'Map the decisions',observation:'The starting concept gives seven actions equal visual weight, although several support the same decision.',choice:'Separate decisions from administrative steps before drawing another screen.',effect:'The map distinguishes information needed now from information that can wait.'},
      {title:'Group the work',observation:'Checking capacity and finding an owner are both parts of deciding who can take the request.',choice:'Group related actions into four stages without deleting the underlying information.',effect:'The redesigned frame has four top-level choices. This is an observable design change, not a productivity claim.'},
      {title:'Bring context closer',observation:'The concept originally separates request details from the assignment screen.',choice:'Keep a request summary and capacity note alongside assignment.',effect:'The prototype demonstrates a contextual handoff without requiring a second page.'},
      {title:'Make recovery explicit',observation:'A fast path is not enough when a request is incomplete.',choice:'Provide a needs-information state and preserve the draft until review.',effect:'The design offers a reversible next step instead of pretending every request is ready.'}
    ],
    artifacts: [
      {title:'01 / Starting inventory',note:'Seven equal actions in the constructed starting state.',items:['Open','Check','Find','Prioritize','Capacity','Confirm','Notify']},
      {title:'02 / Decision map',note:'Administrative actions grouped by the decision they support.',items:['Understand → request + details','Prioritize → urgency + impact','Assign → owner + capacity','Review → confirm + notify']},
      {title:'03 / Screen hierarchy',note:'One next action; supporting context remains visible.',items:['Request summary','Current stage','Supporting context','Primary action']},
      {title:'04 / Alternative rejected',note:'A single long form exposes every field at once.',items:['Alternative: all inputs together','Tradeoff: fewer transitions, more initial complexity','Selected: staged disclosure']},
      {title:'05 / Exception route',note:'Missing information is a first-class state.',items:['Detect missing context','Save the request','Ask for the missing detail','Resume the same stage']},
      {title:'06 / Review frame',note:'Inspect the consequences before sending an update.',items:['Owner','Priority','Request summary','Edit before confirming']},
      {title:'07 / Test protocol',note:'Proposed validation, not completed research.',items:['Find the next action unaided','Assign a request','Recover an incomplete request','Check the handoff summary']},
      {title:'08 / Evidence boundary',note:'What this concept does and does not establish.',items:['Shown: seven actions grouped into four stages','Unmeasured: time saved, error rate, adoption','Next: observe representative operators']}
    ]
  },
  fieldnote: {
    name:'Fieldnote',label:'Identity & editorial systems',headline:'Expertise, without the decoding.',
    description:'A consulting identity concept that connects a clear service story to visible examples instead of a wall of capabilities.',
    services:['identity','web'],color:'#536b47',
    before:['Solutions','Capabilities','Our expertise','Approach','More services','Discover more'],
    after:['Understand the problem','See a relevant example','Explore the approach','Discuss the fit'],
    decisions:[
      {title:'Name the problem',observation:'The starting concept labels services from the organization’s point of view.',choice:'Lead with the questions a potential client is trying to answer.',effect:'The redesigned navigation describes destinations rather than internal departments.'},
      {title:'Show the thinking',observation:'A capability list alone cannot show how a recommendation is made.',choice:'Pair one service with an example and a short decision note.',effect:'The visitor can inspect the reasoning before reading more promotional language.'},
      {title:'Build an editorial kit',observation:'Specialist topics need variation without making every page a different system.',choice:'Use repeatable field-note components: question, observation, implication, next step.',effect:'The concept shares typography and structure while leaving room for specialist detail.'}
    ],
    artifacts:[
      {title:'01 / Message ladder',note:'A constructed hierarchy for the concept.',items:['Question the visitor has','Plain-language offer','Example','Next step']},
      {title:'02 / Editorial components',note:'A reusable structure for explaining specialist work.',items:['Observation','Context','Implication','Recommendation']},
      {title:'03 / Alternative rejected',note:'A larger capability grid would preserve internal terminology.',items:['Rejected: more equally weighted service boxes','Selected: fewer questions with deeper examples','Tradeoff: requires better editorial work']},
      {title:'04 / Validation proposal',note:'No client or reader study has been conducted.',items:['Can readers name the offer?','Can they find a fitting example?','Can they explain the next action?']}
    ]
  },
  threshold: {
    name:'Threshold',label:'Research & product flows',headline:'A first step worth taking.',
    description:'An onboarding concept that starts with a useful outcome and reveals setup only when it becomes necessary.',
    services:['research','product'],color:'#615976',
    before:['Create account','Choose plan','Set workspace','Invite everyone','Configure settings','Start a task'],
    after:['Choose a first goal','Try a guided task','Save your progress','Set up what you need'],
    decisions:[
      {title:'Start with a goal',observation:'The constructed starting flow asks for configuration before explaining the benefit.',choice:'Ask what the visitor is trying to accomplish first.',effect:'The next screen can make a relevant promise rather than present a generic setup checklist.'},
      {title:'Demonstrate value',observation:'An empty workspace does not explain what useful work looks like.',choice:'Offer a small guided task using clearly marked example data.',effect:'The prototype shows an outcome before asking for more setup.'},
      {title:'Preserve agency',observation:'Not every visitor needs a team, integration, or paid plan to begin.',choice:'Defer optional configuration and make skip/back paths explicit.',effect:'The concept supports exploration without forcing unnecessary commitments.'}
    ],
    artifacts:[
      {title:'01 / Entry hypotheses',note:'Assumptions to test, not research findings.',items:['A goal is easier to choose than a configuration','Example data can explain value','Optional setup should stay optional']},
      {title:'02 / First-session path',note:'A goal-led prototype sequence.',items:['Choose goal → guided task','Inspect example result','Save or leave','Configure only when needed']},
      {title:'03 / Alternative rejected',note:'A compulsory checklist makes readiness feel like progress.',items:['Rejected: all setup before exploration','Selected: useful task before optional setup','Risk: examples must match the real product']},
      {title:'04 / Validation proposal',note:'Conversion or completion gains have not been measured.',items:['Observe first-task completion','Ask what value users expected','Inspect skip and return behavior']}
    ]
  }
};
export const caseKeys = Object.keys(cases) as CaseKey[];
export function getCase(slug: string): CaseStudy { return cases[slug as CaseKey] || cases.atlas; }
