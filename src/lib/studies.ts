export type StudyKey = 'atlas' | 'fieldnote' | 'threshold';
export interface StudyNode { id: string; title: string; learned: string; decision: string; changed: string; artifact: string; }
export interface Artifact { key: string; title: string; caption: string; }
export interface Study { name: string; match: string; question: string; before: string; after: string; annotations: { title: string; text: string }[]; nodes: StudyNode[]; artifacts: Artifact[]; }
export const studies: Record<StudyKey, Study> = {
  atlas: {
    name: 'Atlas', match: 'A workflow concept about grouping decisions, preserving context and making a next action visible.',
    question: 'What if a service workspace were organized around the next decision—not every available feature?',
    before: 'Seven equally prominent navigation choices split requests, files, people and reports into separate destinations.',
    after: 'Four navigation groups put requests and their supporting context together. The change is counted in these concept screens; it is not a measured business outcome.',
    annotations: [
      { title: '01 / Fewer competing choices', text: 'Seven top-level items become Overview, Requests, People and Settings. Reports and files remain available in context rather than disappearing.' },
      { title: '02 / Work, with its context', text: 'The active request, its status and the supporting information live in one workspace instead of separate destinations.' },
      { title: '03 / One obvious next step', text: 'Review the selected request is the primary action. Secondary controls remain available without the same visual weight.' }
    ],
    nodes: [
      { id: 'inventory', title: 'Inventory the decisions', learned: 'In the starting concept, navigation mixes actions, objects and administration at the same level.', decision: 'List the seven choices and distinguish frequent work from occasional configuration.', changed: 'The inventory makes the grouping question inspectable instead of treating it as a styling preference.', artifact: 'inventory' },
      { id: 'group', title: 'Group without deleting', learned: 'Files and reports help with a request; they do not always need separate starting points.', decision: 'Use four stable navigation groups and keep supporting tools with their task.', changed: 'The grouped map explains where each of the original seven destinations went.', artifact: 'grouping' },
      { id: 'context', title: 'Reveal context in place', learned: 'A short navigation menu alone does not explain what to do next.', decision: 'Show a selected request beside a focused review panel.', changed: 'The detail concept keeps the task, status and primary action visible together.', artifact: 'detail' },
      { id: 'test', title: 'Make the hypothesis testable', learned: 'A concept cannot establish that real teams would be faster or less confused.', decision: 'Compare request-finding and review tasks with representative users before making outcome claims.', changed: 'The final screen is a testable proposal, with validation questions documented in the story.', artifact: 'after' }
    ],
    artifacts: [
      { key:'inventory', title:'01 / Task inventory', caption:'Seven starting destinations classified as work, context or configuration. This is an analysis of the illustrated concept, not interview data.' },
      { key:'grouping', title:'02 / Grouping map', caption:'A visible mapping from the seven starting destinations into four navigation groups. Nothing essential is silently removed.' },
      { key:'before', title:'03 / Starting interface', caption:'An intentionally constructed baseline with equally weighted choices. It is not a screenshot of a client product.' },
      { key:'rejected', title:'04 / Rejected direction', caption:'An explored all-in-one menu hides too much. A smaller menu is not automatically a clearer workflow.' },
      { key:'after', title:'05 / Proposed workspace', caption:'A four-group navigation system and a focused review area, using synthetic sample requests.' },
      { key:'detail', title:'06 / Contextual detail', caption:'Request information and the next action share one place. Secondary information stays available.' },
      { key:'mobile', title:'07 / Mobile hierarchy', caption:'A narrow-screen concept prioritizes the request queue before its detail view, rather than squeezing in a desktop sidebar.' },
      { key:'components', title:'08 / Component vocabulary', caption:'A small set of type, status, spacing and action treatments makes the hierarchy reusable.' }
    ]
  },
  fieldnote: {
    name:'Fieldnote', match:'An identity and web concept about making specialist knowledge readable and consistent.',
    question:'How can a specialist practice feel coherent without making every topic sound the same?',
    before:'A constructed service page gives long capability lists, repeated headings and conflicting treatments similar emphasis.',
    after:'One editorial system separates the offer, supporting evidence and deeper reading. The concept demonstrates consistency, not an observed increase in trust.',
    annotations:[
      {title:'01 / A plain-language offer',text:'The opening states a useful proposition before the complete list of capabilities.'},
      {title:'02 / Proof gets a place',text:'An example and a field note sit beside the offer so a visitor can inspect the thinking.'},
      {title:'03 / One visual grammar',text:'A shared type scale and spacing system connect the homepage, editorial note and service detail.'}
    ],
    nodes:[
      {id:'story',title:'Separate offer from inventory',learned:'The starting concept treats capabilities as its main story.',decision:'Lead with a plain-language proposition and put specialist detail a level deeper.',changed:'The after frame makes the main message legible before the full taxonomy.',artifact:'after'},
      {id:'voice',title:'Build an editorial vocabulary',learned:'Different content lengths need different treatments, not unrelated identities.',decision:'Create shared heading, label, note and link styles.',changed:'The component sheet becomes a common grammar across formats.',artifact:'components'},
      {id:'depth',title:'Give specialist detail room',learned:'Compression can make technical knowledge feel superficial.',decision:'Preserve a dedicated reading layout with examples and clear subheadings.',changed:'The detail frame shows how depth fits into the same visual system.',artifact:'detail'}
    ],
    artifacts:[
      {key:'before',title:'01 / Starting service page',caption:'A deliberately uneven concept baseline; not client work.'},
      {key:'after',title:'02 / Editorial homepage',caption:'A proposed offer, example and reading path built into one coherent composition.'},
      {key:'detail',title:'03 / Reading view',caption:'Longer specialist material follows the same hierarchy without behaving like a promotional landing page.'},
      {key:'components',title:'04 / Editorial vocabulary',caption:'Type, label, note and action treatments collected as a reusable concept system.'}
    ]
  },
  threshold: {
    name:'Threshold',match:'An onboarding concept about asking only for what is needed now, with a visible route and recoverable choices.',
    question:'What does someone need to decide before they can experience a product—not before they can configure everything?',
    before:'The starting concept requests a profile, team setup, integrations, notifications and preferences at once.',
    after:'Three visible stages—goal, workspace, first task—introduce advanced configuration later. This is a proposed flow, not evidence of improved activation.',
    annotations:[
      {title:'01 / Start with intent',text:'The first question is about the intended task, not every available setting.'},
      {title:'02 / Show a short route',text:'Goal, workspace and first task make progress understandable. The user can go back.'},
      {title:'03 / Keep choices recoverable',text:'Integrations and notifications are deferred, not deleted, and can be changed later.'}
    ],
    nodes:[
      {id:'scope',title:'Separate essential from optional',learned:'The illustrated baseline asks for five unrelated configuration decisions.',decision:'Classify each choice by whether it blocks the first useful task.',changed:'The before/after comparison makes the proposed deferral explicit.',artifact:'before'},
      {id:'route',title:'Make progress visible',learned:'Removing fields does not by itself explain the remaining journey.',decision:'Show three named stages and one question at a time.',changed:'The proposed screen establishes a clear route and next step.',artifact:'after'},
      {id:'recovery',title:'Design the return path',learned:'A recommended default can become a trap if it cannot be revisited.',decision:'Provide a summary and an explicit way to change choices.',changed:'The detail state shows recoverability rather than claiming an activation lift.',artifact:'detail'}
    ],
    artifacts:[
      {key:'before',title:'01 / Configuration-first baseline',caption:'Five setup groups in a constructed initial screen, with synthetic values.'},
      {key:'after',title:'02 / Goal-first route',caption:'A proposed three-stage onboarding path with a single primary action.'},
      {key:'detail',title:'03 / Review and recovery',caption:'A summary keeps earlier choices visible and revisitable.'},
      {key:'components',title:'04 / Onboarding components',caption:'Step indicator, choice cards and status treatments from the same concept.'}
    ]
  }
};
export const studyKeys = Object.keys(studies) as StudyKey[];
export function getStudy(slug: string): Study { if (!(slug in studies)) throw new Error('Unknown study: ' + slug); return studies[slug as StudyKey]; }
