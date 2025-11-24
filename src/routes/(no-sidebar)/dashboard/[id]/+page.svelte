<script lang="ts">
  import type { PageData } from './$types';
  import { generateEmailTemplate } from '$lib/emails/emailTemplates';
  import { sendEditorAlert } from '$lib/emails/emailAlert';
  import { formatTitlesForSubject } from '$lib/utils/emailFormat';  
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';


  export let data: PageData;

  const { submission, readers, user } = data;

  // Determine logged-in user role for selective display
  const userRole = user.role;
  const userSubRole = user.subRole || '';
  console.log('user: ' + JSON.stringify(user))
  console.log('userSubRole: ' + userSubRole)
  const isEIC = userRole === 'EIC';

  // Editable fields
  let readerNote = submission.readerNote || '';

  // EIC-only editable fields
  let title = submission.title || '';
  let name = submission.name || '';
  let email = submission.email || '';
  let coverLetter = submission.coverLetter || '';

  // Display-only fields
  let wordCount = submission.wordCount || '';
  let typeField = submission.type || '';
  let statusField = submission.status || '';
  let feedbackRequested = submission.feedback || false;
  let createdAt = submission.createdAt?.slice(0, 10) || '';

  // Local copy for displaying updated submission
  let currentSubmission = { ...submission };

  let saving = false;
  let savingUpdate = false;  
  let savingUnclaim = false;
  let savingAlert = false;
  let savingProcess = false;


  // Email functionality
  $: canEditEmail = isEIC 
  ? (currentSubmission.status === 'Open' || currentSubmission.status === 'Recommended')
  : (currentSubmission.status === 'Open');

  let emailTemplate = submission.emailTemplate || '';
  let currentEmailAction: string | null = null;

  // Tracks Pending Changes
  let pendingStatus: string | null = null;
  let pendingWasRecommended: boolean | null = null;
  let pendingActive: boolean | null = null;

  // Anonymization and email functionality
  let isAnonymized = false;

  $: if (currentEmailAction && submission && user) {
    emailTemplate = generateEmailTemplate(
      currentEmailAction,
      {
        authorName: submission.name || 'Author',
        readerName: user.name || 'Reader',
        readerRole: user.role || 'Staff',
        readerSubRole: user.subRole || 'Staff',
        submissionTitle: submission.title
      },
      isAnonymized
    );
  }

// Handle submission update
async function updateSubmission(action: string) {
  savingUpdate = true;

  const payload: Record<string, any> = { 
    action, 
    readerNote, 
    emailTemplate
  };

  console.log('Payload being sent to server:', payload);

  if (action === 'updateFields' && isEIC) {
    Object.assign(payload, { title, name, email, coverLetter });
  }

  try {
    const res = await fetch(`/dashboard/api/submission/${submission._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      alert('Action failed: ' + errText);
      return;
    }

    const { updatedSubmission } = await res.json();
    currentSubmission = updatedSubmission;

    // Update local variables
    readerNote = currentSubmission.readerNote || '';

    if (isEIC) {
      title = currentSubmission.title || '';
      name = currentSubmission.name || '';
      email = currentSubmission.email || '';
      coverLetter = currentSubmission.coverLetter || '';
    }

    alert(action !== 'updateNotes' ? 'Action completed successfully!' : '');
  } catch (err: any) {
    console.error(err);
    alert('Unexpected error: ' + err.message);
  } finally {
    savingUpdate = false;
  }
}

  // Handles buttons for changing the email and setting the values
  function handleEmailAction(action: string) {
    console.log('Email action triggered:', action);
    
    currentEmailAction = action;
    
    // Set pending values based on action
    switch (action) {
      case 'recommend-high':
      case 'recommend-middle':  
      case 'recommend-low':
        pendingStatus = 'Recommended';
        pendingWasRecommended = true;
        pendingActive = true;
        //console.log('Set recommendation values:', {
          //pendingStatus,
          //pendingWasRecommended,
          //pendingActive
        //});
        break;
        
    case 'reject-high':
    case 'reject-middle':  
    case 'reject-low':
      // Map rejection levels to specific rounds
      let rejectionRound;
      switch (action) {
        case 'reject-low':
          rejectionRound = 'First Round';
          break;
        case 'reject-middle':
          rejectionRound = 'Second Round';
          break;
        case 'reject-high':
          rejectionRound = 'Third Round';
          break;
      }
      
      pendingStatus = `Rejected, ${rejectionRound}`;
      pendingActive = false;
      //console.log('Set rejection values:', {
        //pendingStatus,
        //pendingWasRecommended,
        //pendingActive,
        //rejectionRound
      //});
      break;
    }
    
    //console.log('Final pending state:', {
      //currentEmailAction,
      //pendingStatus,
      //pendingWasRecommended,
      //pendingActive
    //});
  }

// Handle process and send email
async function processSubmission() {
  savingProcess = true;
  try {
    // Create payload with status changes for processing
    const processPayload: Record<string, any> = { 
      action: 'processSubmission',
      readerNote, 
      emailTemplate
    };

    // Include pending status changes for processing
    if (pendingStatus !== null) {
      processPayload.status = pendingStatus;
    }
    if (pendingWasRecommended !== null) {
      processPayload.wasRecommended = pendingWasRecommended;
    }
    if (pendingActive !== null) {
      processPayload.active = pendingActive;
    }

    // Include EIC fields if applicable
    if (isEIC) {
      Object.assign(processPayload, { title, name, email, coverLetter });
    }

    console.log('Processing payload:', processPayload);

    // Update submission with status changes
    const res = await fetch(`/dashboard/api/submission/${submission._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error('Failed to update submission: ' + errText);
    }

    const { updatedSubmission } = await res.json();
    currentSubmission = updatedSubmission;

    // Clear pending values after successful processing
    pendingStatus = null;
    pendingWasRecommended = null;
    pendingActive = null;
    currentEmailAction = null;
    
     const formattedSubject = formatTitlesForSubject(currentSubmission.title);

    // Then send the email using the updated submission data
    const response = await fetch(`/dashboard/api/submission/${submission._id}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailTemplate: emailTemplate,
        recipientEmail: currentSubmission.email,
        subject: `Re: Haven Spec Magazine — ${formattedSubject}`
      })
    });
    
    if (response.ok) {
      console.log('Email sent successfully');
      alert('Submission processed and email sent successfully!');
      goto('/dashboard');
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error processing submission: ' + error.message);
  } finally {
    savingProcess = false;
  }
}

  // Resets everything when a reader navigates away; Might be unnecessary, but keeping it as a safety net
  function resetProcessingState() {
    currentEmailAction = null;
    pendingStatus = null;
    pendingWasRecommended = null;
    pendingActive = null;
  }

  onMount(() => {
    //console.log('Component mounted - resetting processing state');
    //console.log('State before reset:', {
      //currentEmailAction,
      //pendingStatus,
      //pendingWasRecommended,
      //pendingActive,
      // isAnonymized
    //});
    
    currentEmailAction = null;
    pendingStatus = null;
    pendingWasRecommended = null;
    pendingActive = null;
    isAnonymized = false;  // Add this line
    
    //console.log('State after reset:', {
      //currentEmailAction,
      //pendingStatus,
      //pendingWasRecommended,
      //pendingActive,
      // isAnonymized      
    //});
  });

async function unclaimSubmission() {
  savingUnclaim = true;
  
  try {
    const response = await fetch(`/dashboard/unclaim/${submission._id}`, {
      method: 'POST'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    alert('Successfully unclaimed submission');
    
    // Redirect back to dashboard since they no longer have access
    window.location.href = '/dashboard';
    
  } catch (error) {
    console.error('Error unclaiming submission:', error);
    alert('Failed to unclaim submission: ' + error.message);
  } finally {
    savingUnclaim = false;
  }
}

////// Alert Editor functionality
async function handleAlertEditor() {
  savingAlert = true;
  
  try {
    // Use the new sendEditorAlert function which handles everything
    const result = await sendEditorAlert(currentSubmission, user, readerNote);
    
    // Update the current submission with the response
    if (result.updatedSubmission) {
      currentSubmission = result.updatedSubmission;
    }
    
    alert('Editor has been successfully alerted!');
    
  } catch (error) {
    console.error('Error alerting editor:', error);
    alert('Failed to alert editor: ' + error.message);
  } finally {
    savingAlert = false;
  }
}
</script>

<div class="p-6 flex flex-col space-y-6">
  <!-- Left Column -->
  <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow grid md:grid-cols-2 gap-6">
    <div class="flex flex-col space-y-4">
      {#if isEIC}
        <!-- Editable fields -->
        <div>
          <label class="font-bold mb-1 block text-gray-900 dark:text-white">Title</label>
          <input type="text" bind:value={title} class="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label class="font-bold mb-1 block text-gray-900 dark:text-white">Name</label>
          <input type="text" bind:value={name} class="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label class="font-bold mb-1 block text-gray-900 dark:text-white">Email</label>
          <input type="email" bind:value={email} class="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        {:else}
        <!-- Read-only fields -->
        <div>
          <label class="font-bold mb-1 block text-gray-900 dark:text-white">Title</label>
          <input type="text" value={title} readonly class="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-gray-100" />
        </div>
        <div>
          <label class="font-bold mb-1 block text-gray-900 dark:text-white">Name</label>
          <input type="text" value={name} readonly class="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-gray-100" />
        </div>
        <div>
          <label class="font-bold mb-1 block text-gray-900 dark:text-white">Email</label>
          <input type="email" value={email} readonly class="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-gray-100" />
        </div>
      {/if}

    <!-- Read-only fields -->
    <div class="w-full mb-1 block readonly">
      <strong class="text-gray-900 dark:text-white">Readers:</strong>
      <span class="text-gray-700 dark:text-gray-300">
        {(Array.isArray(submission.reader) ? submission.reader : submission.reader ? [submission.reader] : [])
          .map(id => readers.find(r => r._id === id)?.name)
          .filter(Boolean)
          .join(', ')}
      </span>
    </div>

    <div class="flex flex-wrap gap-2 mt-3">
      <div class="mb-1 pr-3 block readonly">
        <strong class="text-gray-900 dark:text-white">Word Count:</strong> 
        <span class="text-gray-700 dark:text-gray-300">{currentSubmission.wordCount}</span>
      </div>
      <div class="mb-1 pr-3 block readonly">
        <strong class="text-gray-900 dark:text-white">Type:</strong> 
        <span class="text-gray-700 dark:text-gray-300">{currentSubmission.type}</span>
      </div>
      <div class="mb-1 pr-3 block readonly">
        <strong class="text-gray-900 dark:text-white">Status:</strong> 
        <span class="text-gray-700 dark:text-gray-300">{currentSubmission.status}</span>
      </div>
      <div class="mb-1 pr-3 block readonly">
        <strong class="text-gray-900 dark:text-white">Feedback:</strong> 
        <span class="text-gray-700 dark:text-gray-300">{currentSubmission.feedback ? 'Yes' : 'No'}</span>
      </div>
      <div class="mb-1 pr-3 block readonly">
        <strong class="text-gray-900 dark:text-white">Submitted:</strong> 
        <span class="text-gray-700 dark:text-gray-300">{currentSubmission.createdAt?.slice(0,10)}</span>
      </div>
      <div class="w-full block readonly">
        <strong class="text-gray-900 dark:text-white">Cover Letter</strong>
        <textarea value={coverLetter} readonly class="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-gray-100" rows="11"></textarea>
      </div>
    </div>
  </div>

  <!-- Right Column -->
  <div class="flex flex-col space-y-4">
    <div>
      <label class="font-bold mb-1 block text-gray-900 dark:text-white">Reply Email {pendingStatus}</label>
      <textarea 
        bind:value={emailTemplate} 
        class="w-full border border-gray-300 dark:border-gray-600 p-2 rounded text-gray-900 dark:text-white {canEditEmail ? 'bg-white dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900'}" 
        rows="14"
        readonly={!canEditEmail}
      ></textarea>
    </div>

    <!-- Notes (editable for all users) -->
    <div>
      <label class="font-bold mb-1 block text-gray-900 dark:text-white">Reader Notes</label>
      <textarea 
        bind:value={readerNote} 
        class="w-full border border-gray-300 dark:border-gray-600 p-2 rounded text-gray-900 dark:text-white {canEditEmail ? 'bg-white dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900'}" 
        rows="8"
        readonly={!canEditEmail}
      ></textarea>
    </div>
  </div>
</div>

<!-- Action Buttons -->
<!-- Email Action Buttons Grid -->
<div class="flex gap-6">
  <!-- Left side space for your other buttons -->
  <div class="flex-1 flex flex-col gap-3">
    <!-- These buttons can stay as they are since they're not processing buttons -->
    <button
      class="w-full bg-violet-600 dark:bg-violet-700 text-white rounded-lg hover:bg-violet-700 dark:hover:bg-violet-800 transition flex items-center justify-center p-4 disabled:opacity-35"
      on:click={() => submission.file ? window.open(submission.file, '_blank') : alert('No file available')}
      disabled={saving}
    >
      <span class="text-lg font-semibold">
        Open File
      </span>
    </button>

    {#if submission.status === "Open"}
      <button
        class="w-full bg-slate-600 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-800 transition flex items-center justify-center p-4 disabled:opacity-35"
        on:click={unclaimSubmission}
        disabled={savingUnclaim}
      >
        <span class="text-lg font-semibold">
          {savingUnclaim ? 'Unclaiming...' : 'Unclaim'}
        </span>
      </button>
    {/if}

    {#if isEIC}
      <div class="col-span-6 border-t border-gray-300 dark:border-gray-600 my-4"></div>
      <button
        class="w-full bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition flex items-center justify-center p-4 disabled:opacity-35"
        on:click={() => updateSubmission('updateFields')}
        disabled={savingUpdate}
      >
        <span class="text-lg font-semibold">
          {savingUpdate ? 'Updating...' : 'Update'}
        </span>
      </button>
    {/if}

      <!-- Mark Withdrawn button -->
      {#if (isEIC && submission.active)}
        <button
          class="col-span-6 bg-pink-600 dark:bg-pink-700 text-white rounded-lg hover:bg-pink-700 dark:hover:bg-pink-800 transition flex items-center justify-center p-4 disabled:opacity-35"
          on:click={() => updateSubmission('markWithdrawn')}
          disabled={savingUpdate || submission.status === 'Withdrawn'}
        >
          <span class="text-lg font-semibold">
            {savingUpdate ? 'Updating...' : submission.status === 'Withdrawn' ? 'Already Withdrawn' : 'Mark Withdrawn'}
          </span>
        </button>
      {/if}

      <!-- Mark Accepted button -->
      {#if (isEIC && submission.active)}
        <button
          class="col-span-6 bg-green-800 dark:bg-green-900 text-white rounded-lg hover:bg-green-900 dark:hover:bg-green-1000 transition flex items-center justify-center p-4 disabled:opacity-35"
          on:click={() => updateSubmission('markAccepted')}
          disabled={savingUpdate || submission.status === 'Accepted'}
        >
          <span class="text-lg font-semibold">
            {savingUpdate ? 'Updating...' : submission.status === 'Accepted' ? 'Accepted' : 'Mark Accepted'}
          </span>
        </button>
      {/if}
  </div>
  
<!-- Right side - Conditional Email action buttons or status -->
<div class="flex-1">
  {#if (isEIC && submission.active) || (!isEIC && submission.active && submission.status === 'Open')}
    <div class="grid grid-cols-6 gap-3 mb-4">
      <!-- Recommend Buttons -->
      <button
        class="aspect-square rounded-lg transition flex flex-col items-center justify-center p-4 {
          submission.status === 'Recommended' 
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-default' 
            : 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800 cursor-pointer'
        }"
        on:click={submission.status === 'Recommended' ? null : () => handleEmailAction('recommend-high')}
        disabled={submission.status === 'Recommended'}
      >
        <span class="font-semibold">Recommend</span>
        <span class="text-sm">High</span>
      </button>

      <button
        class="aspect-square rounded-lg transition flex flex-col items-center justify-center p-4 {
          submission.status === 'Recommended' 
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-default' 
            : 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-800 cursor-pointer'
        }"
        on:click={submission.status === 'Recommended' ? null : () => handleEmailAction('recommend-middle')}
        disabled={submission.status === 'Recommended'}
      >
        <span class="font-semibold">Recommend</span>
        <span class="text-sm">Middle</span>
      </button>

      <button
        class="aspect-square rounded-lg transition flex flex-col items-center justify-center p-4 {
          submission.status === 'Recommended' 
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-default' 
            : 'bg-green-400 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-800 cursor-pointer'
        }"
        on:click={submission.status === 'Recommended' ? null : () => handleEmailAction('recommend-low')}
        disabled={submission.status === 'Recommended'}
      >
        <span class="font-semibold">Recommend</span>
        <span class="text-sm">Low</span>
      </button>

      <!-- Reject Buttons -->
      <button
        class="aspect-square bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-800 dark:hover:bg-red-900 transition flex flex-col items-center justify-center p-4"
        on:click={() => handleEmailAction('reject-high')}
      >
        <span class="font-semibold">Reject</span>
        <span class="text-sm">High</span>
      </button>
      
      <button
        class="aspect-square bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-800 dark:hover:bg-red-900 transition flex flex-col items-center justify-center p-4"
        on:click={() => handleEmailAction('reject-middle')}
      >
        <span class="font-semibold">Reject</span>
        <span class="text-sm">Middle</span>
      </button>
      
      <button
        class="aspect-square bg-red-400 dark:bg-red-500 text-white rounded-lg hover:bg-red-800 dark:hover:bg-red-900 transition flex flex-col items-center justify-center p-4"
        on:click={() => handleEmailAction('reject-low')}
      >
        <span class="font-semibold">Reject</span>
        <span class="text-sm">Low</span>
      </button>

      <!-- Bottom Row, Anonymize and Send buttons -->
      <button 
        class="aspect-square bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-900 transition flex flex-col items-center justify-center p-4 disabled:opacity-35 disabled:cursor-default"
        on:click={() => isAnonymized = !isAnonymized}
        disabled={!currentEmailAction || !emailTemplate}
      >
        {#if isAnonymized}
          <span class="font-semibold">De-Anonymize</span>
          <span class="text-sm">Signature</span>
        {:else}
          <span class="font-semibold">Anonymize</span>
          <span class="text-sm">Signature</span>
        {/if}
      </button>
        
      <!-- Process button -->
      <button
        class="col-span-5 bg-blue-600 text-white rounded-lg hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-900 transition flex items-center justify-center p-4 disabled:opacity-35 disabled:cursor-default"
        on:click={processSubmission}
        disabled={savingProcess || !emailTemplate}
        title={!emailTemplate ? 'Please generate email template first' : ''}
      >
        <span class="text-lg font-semibold">
          {savingProcess ? 'Processing...' : 'Process & Send Email'}
        </span>
      </button>

      <div class="col-span-6 border-t border-gray-300 dark:border-gray-600 my-4"></div>

      <!-- Alert editor section -->
      <div class="col-span-6 flex items-center gap-4 mb-3">
        <!-- Text with divider lines -->
        <div class="flex-1 space-y-2">
          <div class="relative flex items-center">
            <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span class="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
              CAUTION: This button emails the editor directly. Please 
            </span>
            <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div class="relative flex items-center">
            <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span class="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
              provide the cause of the alert in the Reader Notes field.
            </span>
            <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>      
          </div>
        </div>

        <!-- Button aligned to the full height -->
        <button
          class={`aspect-square rounded-lg transition flex items-center justify-center p-4 disabled:opacity-35 ${
            currentSubmission.alertSent 
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-default' 
              : 'bg-amber-600 dark:bg-amber-700 text-white hover:bg-amber-700 dark:hover:bg-amber-800 cursor-pointer'
          }`}
          on:click={handleAlertEditor}
          disabled={savingAlert || currentSubmission.alertSent}
        >
          <span class="text-lg font-semibold">
            {savingAlert ? 'Alerting...' : currentSubmission.alertSent ? `Alert Sent on ${currentSubmission.alertSentAt?.slice(0, 10)}` : 'Alert Editor'}
          </span>
        </button>
      </div>    
    </div>

        {:else}
          <!-- Show status info when buttons are disabled -->
          <div class="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <div class="text-center text-gray-600 dark:text-gray-300">
              <p class="text-lg font-medium mb-2">Processing Disabled</p>
              <p class="text-sm">Last updated: {new Date(submission.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
