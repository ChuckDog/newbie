import {WorkflowRouteController} from '../src/microservices/workflow/route/route.controller';
import {WorkflowStepController} from '../src/microservices/workflow/step/step.controller';
import {WorkflowStateController} from '../src/microservices/workflow/state/state.controller';

async function main() {
  console.log('Start seeding ...');

  // Seed workflow data.
  console.log('* Creating workflow routes...');

  const workflowRouteController = new WorkflowRouteController();
  const workflowStepController = new WorkflowStepController();
  const workflowStateController = new WorkflowStateController();

  const steps = [
    {step: 'START'},
    {step: 'STEP1_DISPATCH'},
    {step: 'STEP2_TEST'},
    {step: 'STEP3_REVIEW'},
    {step: 'END'},
  ];
  for (let i = 0; i < steps.length; i++) {
    await workflowStepController.createWorkflowStep(steps[i]);
  }

  const states = [
    {state: 'Pending Dispatch'}, // [Recruiter] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen

    {state: 'Pending Test'}, // [Referral Coordinator] assign to [Provider] to work on STEP2_TEST screen

    {state: 'Pass'}, // [Provider] finish the process
    {state: 'Fail'}, // [Provider] finish the process
    {state: 'Discontinue'}, // [Provider] finish the process
    {state: 'Termed-Secondary Medical Hold'}, // [Provider] finish the process
    {state: 'Cancelled'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {state: 'Cancelled - CV hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {state: 'Cancelled - Medical Hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {state: 'CV Hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP2_TEST screen
    {state: 'Lab Hold'}, // [Provider] assign to [Referral Coordinator] to work on STEP2_TEST screen
    {state: 'Late'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen
    {state: 'Medical Hold'}, // [Provider] assign to [Secondary Reviewer] to work on STEP3_REVIEW screen
    {state: 'Reschedule'}, // [Provider] assign to [Referral Coordinator] to work on STEP1_DISPATCH screen

    {state: 'D-Failed'}, // [Secondary Reviewer] finish the process
    {state: 'MD-CLR'}, // [Secondary Reviewer] finish the process
    {state: 'MD-CLR-P-CV'}, // [Secondary Reviewer] finish the process
    {state: 'MD-CLR-WL'}, // [Secondary Reviewer] finish the process
    {state: 'MD-DISC'}, // [Secondary Reviewer] finish the process
    {state: 'MD-NOT-CLR'}, // [Secondary Reviewer] finish the process
    {state: 'Terminated'}, // [Secondary Reviewer] finish the process
    {state: 'Reviewer Hold'}, // [Secondary Reviewer] assign to [Secondary Reviewer] to work on STEP3_REVIEW screen
    {state: 'Resubmission'}, // [Secondary Reviewer] assign to [Provider] to work on STEP2_TEST screen
  ];
  for (let i = 0; i < states.length; i++) {
    await workflowStateController.createWorkflowState(states[i]);
  }

  const workflowForfinalStates = [
    {step: 'STEP2_TEST', state: 'Pass', nextStep: 'END'},
    {step: 'STEP2_TEST', state: 'Fail', nextStep: 'END'},
    {step: 'STEP2_TEST', state: 'Discontinue', nextStep: 'END'},
    {
      step: 'STEP2_TEST',
      state: 'Termed-Secondary Medical Hold',
      nextStep: 'END',
    },
    {step: 'STEP3_REVIEW', state: 'D-Failed', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'MD-CLR', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'MD-CLR-P-CV', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'MD-CLR-WL', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'MD-DISC', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'MD-NOT-CLR', nextStep: 'END'},
    {step: 'STEP3_REVIEW', state: 'Terminated', nextStep: 'END'},
  ];
  for (let i = 0; i < workflowForfinalStates.length; i++) {
    await workflowRouteController.createWorkflowRoute(
      workflowForfinalStates[i]
    );
  }

  // Seeding Finished.
  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
