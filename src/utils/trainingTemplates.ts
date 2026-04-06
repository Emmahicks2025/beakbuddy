// Training plan templates and utilities
import { TrainingPlan } from '../types';

export interface TrainingTemplate {
    id: string;
    title: string;
    description: string;
    icon: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    sessionsPerWeek: number;
    milestones: Milestone[];
    dailyActivities: DailyActivity[];
    generalObservables: Observable[]; // General observables for any session
}

export interface Milestone {
    week: number;
    title: string;
    description: string;
    completed?: boolean;
}

export interface DailyActivity {
    day: number;
    activity: string;
    duration: number;
    instructions: string;
    tips: string[];
    observables?: Observable[]; // Checkable behaviors to track
}

export interface Observable {
    id: string;
    description: string;
    category: 'behavior' | 'milestone' | 'skill';
    relevantMilestones?: string[]; // Only show for these milestones
}

export const TRAINING_TEMPLATES: TrainingTemplate[] = [
    {
        id: 'potty-training',
        title: 'Potty Training',
        description: 'Teach your parrot to use a designated potty area',
        icon: '🚽',
        difficulty: 'Beginner',
        duration: '4-6 weeks',
        sessionsPerWeek: 5,
        generalObservables: [
            { id: 'potty-obs-1', description: 'Bird showed pre-bathroom signals (tail lift, backing up)', category: 'behavior', relevantMilestones: ['Observation Phase'] },
            { id: 'potty-obs-2', description: 'Successfully used designated potty perch', category: 'milestone', relevantMilestones: ['Introduction', 'Association', 'Reinforcement', 'Independence', 'Mastery'] },
            { id: 'potty-obs-3', description: 'No accidents during session', category: 'skill', relevantMilestones: ['Reinforcement', 'Independence', 'Mastery'] },
            { id: 'potty-obs-4', description: 'Responded to potty cue/command', category: 'milestone', relevantMilestones: ['Association', 'Reinforcement', 'Independence', 'Mastery'] },
            { id: 'potty-obs-5', description: 'Stayed on potty perch until finished', category: 'behavior', relevantMilestones: ['Introduction', 'Association', 'Reinforcement', 'Independence', 'Mastery'] },
            { id: 'potty-obs-6', description: 'Accepted reward after using potty', category: 'skill', relevantMilestones: ['Introduction', 'Association', 'Reinforcement', 'Independence', 'Mastery'] },
            { id: 'potty-obs-7', description: 'Showed understanding of potty location', category: 'milestone', relevantMilestones: ['Association', 'Reinforcement', 'Independence', 'Mastery'] },
            { id: 'potty-obs-8', description: 'Maintained clean area outside potty zone', category: 'skill', relevantMilestones: ['Association', 'Reinforcement', 'Independence', 'Mastery'] }
        ],
        milestones: [
            {
                week: 1,
                title: 'Observation Phase',
                description: 'Learn your parrot\'s bathroom schedule and signals'
            },
            {
                week: 2,
                title: 'Introduction',
                description: 'Introduce the potty perch and reward exploration'
            },
            {
                week: 3,
                title: 'Association',
                description: 'Place parrot on potty before expected bathroom time'
            },
            {
                week: 4,
                title: 'Reinforcement',
                description: 'Consistent rewards for using the potty'
            },
            {
                week: 5,
                title: 'Independence',
                description: 'Parrot begins going to potty on their own'
            },
            {
                week: 6,
                title: 'Mastery',
                description: 'Consistent potty use with minimal accidents'
            }
        ],
        dailyActivities: [
            {
                day: 1,
                activity: 'Observe and Record',
                duration: 15,
                instructions: 'Watch your parrot throughout the day and note when they go to the bathroom. Look for signals like backing up or tail lifting.',
                tips: [
                    'Keep a notebook handy',
                    'Most parrots go every 15-30 minutes',
                    'Note the time and any pre-bathroom behaviors'
                ],
                observables: [
                    { id: 'obs-1', description: 'Noticed tail lifting before bathroom', category: 'behavior' },
                    { id: 'obs-2', description: 'Observed backing up motion', category: 'behavior' },
                    { id: 'obs-3', description: 'Identified consistent timing pattern', category: 'milestone' },
                    { id: 'obs-4', description: 'Recorded at least 5 bathroom times', category: 'skill' }
                ]
            },
            {
                day: 2,
                activity: 'Pattern Recognition',
                duration: 15,
                instructions: 'Continue observing and start identifying patterns. When do they typically go? After eating? After waking up?',
                tips: [
                    'Look for consistent timing',
                    'Note environmental triggers',
                    'Identify physical signals'
                ],
                observables: [
                    { id: 'obs-5', description: 'Identified post-meal bathroom pattern', category: 'milestone' },
                    { id: 'obs-6', description: 'Noticed morning routine timing', category: 'behavior' },
                    { id: 'obs-7', description: 'Recognized pre-bathroom body language', category: 'skill' }
                ]
            },
            {
                day: 3,
                activity: 'Introduce Potty Perch',
                duration: 20,
                instructions: 'Place a designated perch in the cage. Let your parrot explore it naturally. Reward any interaction.',
                tips: [
                    'Use a different texture than regular perches',
                    'Place it in an accessible location',
                    'Reward with treats and praise'
                ],
                observables: [
                    { id: 'obs-8', description: 'Bird approached potty perch', category: 'behavior' },
                    { id: 'obs-9', description: 'Bird stepped onto potty perch', category: 'milestone' },
                    { id: 'obs-10', description: 'Bird stayed on perch for 5+ seconds', category: 'skill' },
                    { id: 'obs-11', description: 'Successfully rewarded perch interaction', category: 'skill' }
                ]
            },
            {
                day: 4,
                activity: 'Cue Association',
                duration: 15,
                instructions: 'Say your chosen cue (e.g., "Go Potty") right as you see the bird about to go. Reward immediately.',
                tips: [
                    'Timing is critical',
                    'Use the same phrase every time',
                    'Party party party when they get it right'
                ],
                observables: [
                    { id: 'obs-12', description: 'Bird paused after hearing cue', category: 'behavior' },
                    { id: 'obs-13', description: 'Bird went potty within 5 seconds of cue', category: 'milestone' }
                ]
            }
        ]
    },
    {
        id: 'step-up',
        title: 'Step-Up Training',
        description: 'Essential command for handling and bonding',
        icon: '👆',
        difficulty: 'Beginner',
        duration: '2-3 weeks',
        sessionsPerWeek: 7,
        generalObservables: [
            { id: 'stepup-obs-1', description: 'Bird stepped up on first request', category: 'milestone' },
            { id: 'stepup-obs-2', description: 'Maintained balance on hand/finger', category: 'skill' },
            { id: 'stepup-obs-3', description: 'No biting or aggression during step-up', category: 'behavior' },
            { id: 'stepup-obs-4', description: 'Responded to verbal "step up" cue', category: 'milestone' },
            { id: 'stepup-obs-5', description: 'Stepped up from multiple locations (cage, perch, shoulder)', category: 'skill' },
            { id: 'stepup-obs-6', description: 'Remained calm while being moved', category: 'behavior' },
            { id: 'stepup-obs-7', description: 'Stepped down on command', category: 'milestone' },
            { id: 'stepup-obs-8', description: 'Showed confidence and trust', category: 'behavior' }
        ],
        milestones: [
            {
                week: 1,
                title: 'Trust Building',
                description: 'Build comfort with hand presence near the parrot'
            },
            {
                week: 2,
                title: 'First Steps',
                description: 'Parrot steps onto hand with gentle pressure'
            },
            {
                week: 3,
                title: 'Reliable Response',
                description: 'Consistent step-up on verbal command'
            }
        ],
        dailyActivities: [
            {
                day: 1,
                activity: 'Hand Familiarization',
                duration: 10,
                instructions: 'Place your hand near the cage while offering treats. Let your parrot get comfortable with your hand\'s presence.',
                tips: [
                    'Move slowly and calmly',
                    'Don\'t force interaction',
                    'Use favorite treats'
                ],
                observables: [
                    { id: 'stepup-1', description: 'Bird approached hand without fear', category: 'behavior' },
                    { id: 'stepup-2', description: 'Took treat from hand', category: 'milestone' },
                    { id: 'stepup-3', description: 'Stayed calm with hand nearby', category: 'skill' },
                    { id: 'stepup-4', description: 'Made eye contact while eating', category: 'behavior' }
                ]
            },
            {
                day: 2,
                activity: 'Gentle Pressure',
                duration: 15,
                instructions: 'Gently press your finger against the parrot\'s lower chest while saying "step up". Reward any movement toward your hand.',
                tips: [
                    'Use consistent verbal cue',
                    'Apply gentle, steady pressure',
                    'Reward immediately'
                ],
                observables: [
                    { id: 'stepup-5', description: 'Responded to "step up" command', category: 'milestone' },
                    { id: 'stepup-6', description: 'Lifted one foot toward hand', category: 'behavior' },
                    { id: 'stepup-7', description: 'Placed both feet on finger', category: 'milestone' },
                    { id: 'stepup-8', description: 'Maintained balance on hand for 3+ seconds', category: 'skill' }
                ]
            }
        ]
    },
    {
        id: 'recall-training',
        title: 'Recall Training',
        description: 'Teach your parrot to fly to you on command',
        icon: '🦅',
        difficulty: 'Intermediate',
        duration: '6-8 weeks',
        sessionsPerWeek: 5,
        generalObservables: [
            { id: 'recall-obs-1', description: 'Bird responded to recall cue immediately', category: 'milestone' },
            { id: 'recall-obs-2', description: 'Flew directly to target/hand (no hesitation)', category: 'behavior' },
            { id: 'recall-obs-3', description: 'Landed accurately and gently', category: 'skill' },
            { id: 'recall-obs-4', description: 'Recalled from increasing distances (5ft, 10ft, 15ft+)', category: 'milestone' },
            { id: 'recall-obs-5', description: 'Maintained focus despite distractions', category: 'skill' },
            { id: 'recall-obs-6', description: 'Showed enthusiasm for recall', category: 'behavior' },
            { id: 'recall-obs-7', description: 'Accepted reward upon arrival', category: 'behavior' },
            { id: 'recall-obs-8', description: 'Repeated recall successfully 3+ times', category: 'milestone' }
        ],
        milestones: [
            {
                week: 1,
                title: 'Target Training',
                description: 'Parrot learns to touch a target stick'
            },
            {
                week: 2,
                title: 'Short Distances',
                description: 'Parrot flies 1-2 feet to target'
            },
            {
                week: 4,
                title: 'Medium Distances',
                description: 'Parrot flies 5-10 feet reliably'
            },
            {
                week: 6,
                title: 'Long Distances',
                description: 'Parrot flies across the room'
            },
            {
                week: 8,
                title: 'Outdoor Recall',
                description: 'Reliable recall in outdoor environments'
            }
        ],
        dailyActivities: [
            {
                day: 1,
                activity: 'Target Introduction',
                duration: 10,
                instructions: 'Present a target stick (chopstick with colorful tip). Reward when parrot touches it with beak.',
                tips: [
                    'Start very close',
                    'Click or say "good" immediately',
                    'Use high-value treats'
                ],
                observables: [
                    { id: 'recall-1', description: 'Bird showed interest in target stick', category: 'behavior' },
                    { id: 'recall-2', description: 'Touched target with beak', category: 'milestone' },
                    { id: 'recall-3', description: 'Followed target with head movement', category: 'skill' },
                    { id: 'recall-4', description: 'Repeated target touch 5+ times', category: 'milestone' }
                ]
            },
            {
                day: 2,
                activity: 'Short Distance Recall',
                duration: 15,
                instructions: 'Hold target 1-2 feet away. Encourage bird to hop or fly to touch it. Reward immediately upon contact.',
                tips: [
                    'Start with very short distances',
                    'Use enthusiastic voice',
                    'Reward every successful attempt'
                ],
                observables: [
                    { id: 'recall-5', description: 'Hopped toward target', category: 'behavior' },
                    { id: 'recall-6', description: 'Flew 1-2 feet to target', category: 'milestone' },
                    { id: 'recall-7', description: 'Landed accurately on perch/hand', category: 'skill' },
                    { id: 'recall-8', description: 'Responded to recall cue word', category: 'milestone' }
                ]
            }
        ]
    },
    {
        id: 'trick-training',
        title: 'Fun Tricks',
        description: 'Teach entertaining tricks like wave, spin, and play dead',
        icon: '🎪',
        difficulty: 'Intermediate',
        duration: '4-6 weeks',
        sessionsPerWeek: 4,
        generalObservables: [
            { id: 'trick-obs-1', description: 'Bird performed trick on first cue', category: 'milestone' },
            { id: 'trick-obs-2', description: 'Completed trick with good form/accuracy', category: 'skill' },
            { id: 'trick-obs-3', description: 'Showed enthusiasm and engagement', category: 'behavior' },
            { id: 'trick-obs-4', description: 'Maintained focus throughout session', category: 'behavior' },
            { id: 'trick-obs-5', description: 'Performed trick without food lure visible', category: 'milestone' },
            { id: 'trick-obs-6', description: 'Chained multiple tricks together', category: 'skill' },
            { id: 'trick-obs-7', description: 'Responded to hand signals alone', category: 'milestone' },
            { id: 'trick-obs-8', description: 'Demonstrated improvement from last session', category: 'skill' }
        ],
        milestones: [
            {
                week: 1,
                title: 'Wave',
                description: 'Parrot lifts foot on command'
            },
            {
                week: 2,
                title: 'Spin',
                description: 'Parrot turns in a circle'
            },
            {
                week: 3,
                title: 'Play Dead',
                description: 'Parrot lies on back'
            },
            {
                week: 4,
                title: 'Chain Tricks',
                description: 'Perform multiple tricks in sequence'
            }
        ],
        dailyActivities: [
            {
                day: 1,
                activity: 'Wave Training',
                duration: 10,
                instructions: 'Hold a treat just out of reach. When bird lifts foot, say "wave" and reward. Gradually increase height.',
                tips: [
                    'Start with natural foot lifting',
                    'Add verbal cue consistently',
                    'Reward small progress'
                ],
                observables: [
                    { id: 'trick-1', description: 'Lifted foot naturally', category: 'behavior' },
                    { id: 'trick-2', description: 'Lifted foot on "wave" command', category: 'milestone' },
                    { id: 'trick-3', description: 'Held foot up for 2+ seconds', category: 'skill' },
                    { id: 'trick-4', description: 'Waved without treat visible', category: 'milestone' }
                ]
            },
            {
                day: 2,
                activity: 'Spin Training',
                duration: 12,
                instructions: 'Use target stick or treat to lure bird in a circle. Say "spin" as they turn. Reward full rotation.',
                tips: [
                    'Go slowly at first',
                    'Break into quarter turns',
                    'Celebrate full spins enthusiastically'
                ],
                observables: [
                    { id: 'trick-5', description: 'Followed lure in quarter circle', category: 'behavior' },
                    { id: 'trick-6', description: 'Completed half turn (180°)', category: 'skill' },
                    { id: 'trick-7', description: 'Completed full spin (360°)', category: 'milestone' },
                    { id: 'trick-8', description: 'Spun on "spin" command alone', category: 'milestone' }
                ]
            }
        ]
    },
    {
        id: 'behavior-modification',
        title: 'Behavior Modification',
        description: 'Address biting, screaming, or other unwanted behaviors',
        icon: '🔧',
        difficulty: 'Advanced',
        duration: '8-12 weeks',
        sessionsPerWeek: 7,
        generalObservables: [
            { id: 'behavior-obs-1', description: 'Identified trigger before problem behavior occurred', category: 'milestone' },
            { id: 'behavior-obs-2', description: 'Successfully redirected to alternative behavior', category: 'milestone' },
            { id: 'behavior-obs-3', description: 'Problem behavior reduced in intensity', category: 'skill' },
            { id: 'behavior-obs-4', description: 'Bird accepted redirection calmly', category: 'behavior' },
            { id: 'behavior-obs-5', description: 'Showed longer periods between incidents', category: 'skill' },
            { id: 'behavior-obs-6', description: 'Responded to positive reinforcement', category: 'behavior' },
            { id: 'behavior-obs-7', description: 'Demonstrated self-control/impulse control', category: 'milestone' },
            { id: 'behavior-obs-8', description: 'No instances of target problem behavior', category: 'milestone' }
        ],
        milestones: [
            {
                week: 1,
                title: 'Trigger Identification',
                description: 'Identify what causes the unwanted behavior'
            },
            {
                week: 2,
                title: 'Alternative Behaviors',
                description: 'Teach replacement behaviors'
            },
            {
                week: 4,
                title: 'Consistency',
                description: 'Maintain consistent responses to behaviors'
            },
            {
                week: 8,
                title: 'Reduced Frequency',
                description: 'Noticeable decrease in unwanted behavior'
            },
            {
                week: 12,
                title: 'Behavior Eliminated',
                description: 'Unwanted behavior rarely occurs'
            }
        ],
        dailyActivities: [
            {
                day: 1,
                activity: 'Trigger Observation',
                duration: 20,
                instructions: 'Observe and document what triggers the unwanted behavior. Note time, location, and circumstances.',
                tips: [
                    'Keep detailed notes',
                    'Look for patterns',
                    'Don\'t react emotionally to behavior'
                ],
                observables: [
                    { id: 'behavior-1', description: 'Identified specific trigger', category: 'milestone' },
                    { id: 'behavior-2', description: 'Noted warning signs before behavior', category: 'behavior' },
                    { id: 'behavior-3', description: 'Documented time/location pattern', category: 'skill' },
                    { id: 'behavior-4', description: 'Recognized early intervention opportunity', category: 'milestone' }
                ]
            },
            {
                day: 2,
                activity: 'Redirection Practice',
                duration: 15,
                instructions: 'When you see warning signs, redirect to positive behavior. Reward alternative actions immediately.',
                tips: [
                    'Act before unwanted behavior starts',
                    'Offer engaging alternative',
                    'Praise calm behavior'
                ],
                observables: [
                    { id: 'behavior-5', description: 'Successfully redirected before problem behavior', category: 'milestone' },
                    { id: 'behavior-6', description: 'Bird accepted alternative activity', category: 'behavior' },
                    { id: 'behavior-7', description: 'Reduced intensity of problem behavior', category: 'skill' },
                    { id: 'behavior-8', description: 'Bird chose positive behavior independently', category: 'milestone' }
                ]
            },
            {
                day: 3,
                activity: 'Consistency Check',
                duration: 10,
                instructions: 'Verify that everyone in the household is using the same cues and responses.',
                tips: [
                    'Discuss rules with family',
                    'Post rules near cage',
                    'Ensure unified front'
                ],
                observables: [
                    { id: 'behavior-9', description: 'Family members used correct cues', category: 'skill' },
                    { id: 'behavior-10', description: 'Bird responded consistently to multiple people', category: 'milestone' }
                ]
            }
        ]
    },
    {
        id: 'socialization',
        title: 'Socialization',
        description: 'Help your parrot become comfortable with new people and environments',
        icon: '👥',
        difficulty: 'Beginner',
        duration: '6-8 weeks',
        sessionsPerWeek: 4,
        generalObservables: [
            { id: 'social-obs-1', description: 'Remained calm with new person/environment', category: 'milestone' },
            { id: 'social-obs-2', description: 'Showed curiosity rather than fear', category: 'behavior' },
            { id: 'social-obs-3', description: 'Accepted treats in new situation', category: 'skill' },
            { id: 'social-obs-4', description: 'Maintained relaxed body language', category: 'behavior' },
            { id: 'social-obs-5', description: 'Vocalized in friendly manner', category: 'behavior' },
            { id: 'social-obs-6', description: 'Allowed gentle interaction from stranger', category: 'milestone' },
            { id: 'social-obs-7', description: 'Explored new environment confidently', category: 'skill' },
            { id: 'social-obs-8', description: 'Returned to calm state quickly after stimulus', category: 'skill' }
        ],
        milestones: [
            {
                week: 1,
                title: 'Comfort Zone',
                description: 'Establish baseline comfort level'
            },
            {
                week: 2,
                title: 'New People',
                description: 'Introduce one new person at a time'
            },
            {
                week: 4,
                title: 'New Environments',
                description: 'Visit different rooms in the house'
            },
            {
                week: 6,
                title: 'Public Spaces',
                description: 'Short trips to pet-friendly locations'
            },
            {
                week: 8,
                title: 'Confident Bird',
                description: 'Comfortable in various situations'
            }
        ],
        dailyActivities: [
            {
                day: 1,
                activity: 'Baseline Comfort Assessment',
                duration: 10,
                instructions: 'Observe bird\'s comfort level in current environment. Note body language, vocalizations, and activity level.',
                tips: [
                    'Don\'t introduce changes yet',
                    'Document normal behavior',
                    'Note stress signals'
                ],
                observables: [
                    { id: 'social-1', description: 'Identified relaxed body language', category: 'behavior' },
                    { id: 'social-2', description: 'Noted comfortable vocalization patterns', category: 'skill' },
                    { id: 'social-3', description: 'Documented stress signals to watch for', category: 'milestone' },
                    { id: 'social-4', description: 'Established baseline activity level', category: 'behavior' }
                ]
            },
            {
                day: 2,
                activity: 'New Person Introduction',
                duration: 15,
                instructions: 'Have one new person sit quietly near cage. Let bird observe from safe distance. Reward calm behavior.',
                tips: [
                    'Keep distance comfortable',
                    'No sudden movements',
                    'Let bird set the pace'
                ],
                observables: [
                    { id: 'social-5', description: 'Remained calm with stranger present', category: 'milestone' },
                    { id: 'social-6', description: 'Showed curiosity toward new person', category: 'behavior' },
                    { id: 'social-7', description: 'Accepted treat with stranger nearby', category: 'skill' },
                    { id: 'social-8', description: 'Vocalized in friendly manner', category: 'milestone' }
                ]
            }
        ]
    },
    {
        id: 'speech-mimicry',
        title: 'Speech & Mimicry',
        description: 'Teach your parrot to talk and mimic sounds',
        icon: '🗣️',
        difficulty: 'Intermediate',
        duration: '8-12 weeks',
        sessionsPerWeek: 5,
        generalObservables: [
            { id: 'speech-obs-1', description: 'Bird showed interest in sound/word', category: 'behavior' },
            { id: 'speech-obs-2', description: 'Attempted to mimic sound (mumbling)', category: 'milestone' },
            { id: 'speech-obs-3', description: 'Clearly articulated word/sound', category: 'milestone' },
            { id: 'speech-obs-4', description: 'Used word in correct context', category: 'skill' },
            { id: 'speech-obs-5', description: 'Responded vocally to prompt', category: 'behavior' },
            { id: 'speech-obs-6', description: 'Practiced independently (babbling)', category: 'behavior' },
            { id: 'speech-obs-7', description: 'Learned new phrase', category: 'milestone' },
            { id: 'speech-obs-8', description: 'Improved clarity of existing vocabulary', category: 'skill' }
        ],
        milestones: [
            {
                week: 1,
                title: 'Listening Phase',
                description: 'Expose bird to target words consistently'
            },
            {
                week: 3,
                title: 'Mumbling',
                description: 'Bird begins making similar sounds'
            },
            {
                week: 6,
                title: 'First Clear Word',
                description: 'Recognizable pronunciation'
            },
            {
                week: 9,
                title: 'Contextual Use',
                description: 'Using words appropriately (e.g., "Hello" when you enter)'
            },
            {
                week: 12,
                title: 'Vocabulary Expansion',
                description: 'Learning multiple words/phrases'
            }
        ],
        dailyActivities: [
            {
                day: 1,
                activity: 'Word Repetition',
                duration: 10,
                instructions: 'Choose one target word (e.g., "Hello"). Repeat it clearly and enthusiastically to your bird while making eye contact.',
                tips: [
                    'Use high-pitched, excited voice',
                    'Keep sessions short but frequent',
                    'Focus on just one word initially'
                ],
                observables: [
                    { id: 'speech-1', description: 'Bird listened intently (pupil pinning)', category: 'behavior' },
                    { id: 'speech-2', description: 'Made soft vocalizations in response', category: 'behavior' },
                    { id: 'speech-3', description: 'Mimicked general tone/pitch', category: 'skill' },
                    { id: 'speech-4', description: 'Attempted to form word sounds', category: 'milestone' }
                ]
            },
            {
                day: 2,
                activity: 'Contextual Association',
                duration: 15,
                instructions: 'Pair the word with an action/object. Say "Apple" every time you give a slice, or "Night night" when covering the cage.',
                tips: [
                    'Consistency is crucial',
                    'Say word BEFORE the action',
                    'Reward any vocal attempt'
                ],
                observables: [
                    { id: 'speech-5', description: 'Anticipated action after hearing word', category: 'skill' },
                    { id: 'speech-6', description: 'Vocalized during the activity', category: 'behavior' },
                    { id: 'speech-7', description: 'Showed excitement for the object/event', category: 'behavior' },
                    { id: 'speech-8', description: 'Connected word to specific context', category: 'milestone' }
                ]
            }
        ]
    }
];

export const getTemplateById = (id: string): TrainingTemplate | undefined => {
    return TRAINING_TEMPLATES.find(t => t.id === id);
};

export const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
        case 'Beginner': return '#00C853';
        case 'Intermediate': return '#FFB74D';
        case 'Advanced': return '#FF6B6B';
        default: return '#8040BF';
    }
};
