<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  export let data: PageData;
  export let form: ActionData;

  let showAuthorDropdown = false;
  let isSubmitting = false;
  let selectedAuthorCount = 1;
  let selectedPiecesCount = formFields?.piecesPerSubmission?.min || 1;
  let wordCountValue = form?.values?.wordCount || '';
  let fileError = '';

  ////// Author/Name handling
  function handleShowAuthorDropdown() {
    showAuthorDropdown = true;
    // Only set the default when first opening the dropdown
    selectedAuthorCount = Math.max(formFields.submitterName?.min || 1, 2);

    setTimeout(() => {
      document.getElementById('authorCount')?.focus();
    }, 0);
  }

  // Determine the link text
  $: authorLinkText = formFields.submitterName?.min === 1 ? 
    "Have more than one author? Click here!" : 
    "Have more authors? Click here!";

  // Check if we should show the "more authors" link
  $: shouldShowAuthorLink = formFields.submitterName?.allowMultiple && 
    formFields.submitterName?.max > formFields.submitterName?.min;

  ////// Email verification handling
  let emailValue = form?.values?.submitterEmail || '';
  let confirmEmailValue = form?.values?.confirmEmail || '';

  // Check if emails match
  $: emailMismatch = emailValue !== confirmEmailValue && confirmEmailValue.length > 0;

  // Check email format
  $: emailFormatError = emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  ////// Number of Pieces and Titles handling
  $: call = data.call;
  $: formFields = call.formFields || {};
  
  // Calculate pieces options from formFields.piecesPerSubmission
  $: piecesConfig = call.formFields?.piecesPerSubmission;
  $: shouldShowPiecesField = piecesConfig && piecesConfig.visible && piecesConfig.allowMultiple;
  $: piecesOptions = shouldShowPiecesField ? 
    Array.from({ length: piecesConfig.max - piecesConfig.min + 1 }, (_, i) => piecesConfig.min + i) : 
    [];

  $: titleConfig = call.formFields?.submitterTitle;
  $: shouldShowMultipleTitles = titleConfig && titleConfig.visible && titleConfig.allowMultiple && titleConfig.max > 1;
  $: titleCountOptions = shouldShowMultipleTitles ? 
    Array.from({ length: titleConfig.max - titleConfig.min + 1 }, (_, i) => titleConfig.min + i) : 
    [];
  $: selectedTitleCount = form?.values?.titleCount ? parseInt(form.values.titleCount) : (titleConfig?.min || 1);

  // Helper function to format field labels
  function formatLabel(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  ////// Word count validation handling
  $: wordCountError = (() => {
    if (!wordCountValue) return '';
    const count = parseInt(wordCountValue);
    if (isNaN(count)) return 'Please enter a valid number';
    if (formFields.wordCount?.min && count < formFields.wordCount.min) {
      return `Word count must be at least ${formFields.wordCount.min}`;
    }
    if (formFields.wordCount?.max && count > formFields.wordCount.max) {
      return `Word count cannot exceed ${formFields.wordCount.max}`;
    }
    return '';
  })();

  ////// File validation function
  function validateFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    fileError = ''; // Reset error
    
    if (!file) return;
    
    // Check file size (1MB limit)
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      fileError = 'File size must be less than 1MB';
      input.value = '';
      return;
    }
    
    // Check file type
    const allowedTypes = [
      'application/msword',                                                       // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // .docx
      'application/rtf',                                                          // .rtf
      'text/rtf',                                                                 // .rtf (alternative MIME type)
      'application/vnd.oasis.opendocument.text'                                   // .odt (OpenOffice/LibreOffice)
    ];
    if (!allowedTypes.includes(file.type)) {
      fileError = 'Please upload a DOC, DOCX, RTF, or ODT file only';
      input.value = '';
      return;
    }
  }

  // Helper function to format deadline
  function formatDeadline(deadline: string): string {
    return new Date(deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<svelte:head>
  <title>Submit to {call.title}</title>
</svelte:head>

<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded">
  Skip to main content
</a>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-2xl mx-auto">
    <main id="main-content">
    <!-- Call Information -->
    <div class="bg-white shadow rounded-lg mb-8 p-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">{call.title}</h1>
        <div class="flex items-center space-x-4 text-sm text-gray-800 mb-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {call.type}
          </span>
        </div>
      </div>
            <div class="text-md">
        <span class="text-lg"><strong>Overview:</strong></span><br />
        {#if call.callType}
          <span>Call Type: {call.callType}</span>
        {/if} <br />
        {#if call.deadline}
          <span>Deadline: {formatDeadline(call.deadline)}</span>
        {/if}<br /><br />
      </div>      

        <span class="text-lg"><strong>Description:</strong></span><br />
      {#if call.description}
        <div class="prose max-w-none text-gray-700">
            {@html call.description}
        </div>
      {/if}
      <br />
    </div>
    
    <!-- Submission Form -->
    <div class="bg-white shadow rounded-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Submit</h2>

      {#if form?.error}
        <div class="mb-6 bg-red-50 border border-red-200 rounded-md p-4" role="alert" aria-live="assertive">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{form.error}</p>
            </div>
          </div>
        </div>
      {/if}
      <form 
        method="POST" 
        enctype="multipart/form-data" 
        use:enhance={() => {
          isSubmitting = true;
          return async ({ update }) => {
            isSubmitting = false;
            await update();
          };
      }}>

        <!-- FIELDS -->
        <div class="space-y-6">
          <!-- 1. Name/Authors -->
          {#if formFields.submitterName?.visible}
            {#if !formFields.submitterName.allowMultiple}
              <!-- Single Author (allowMultiple = false) -->
              <div>
                <label for="submitterName" class="block text-sm font-medium text-gray-700 mb-2">
                  Name
                  {#if formFields.submitterName.required}
                    <span class="text-red-500" aria-label="required">*</span>
                  {/if}
                </label>
                <input
                  type="text"
                  id="submitterName"
                  name="submitterName"
                  required={formFields.submitterName.required}
                  aria-required={formFields.submitterName.required}
                  value={form?.values?.submitterName || ''}
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="What should we call you?"
                />
              </div>
            {:else}
              <!-- Multiple Authors Allowed -->
              <!-- Live region for announcements (moved outside conditional) -->
              <div class="sr-only" aria-live="polite" aria-atomic="true">
                {#if showAuthorDropdown}
                  Author count selector is now available. {selectedAuthorCount} author fields will be shown.
                {/if}
              </div>
              
              <!-- Show minimum number of name fields -->
              <div>
                {#each Array.from({length: showAuthorDropdown ? selectedAuthorCount : (formFields.submitterName.min || 1)}) as _, index}
                  <label for="submitterName_{index + 1}" class="block text-sm font-medium text-gray-700 mt-6 mb-2">
                    {#if (formFields.submitterName.min || 1) === 1 && index === 0}
                      Name
                    {:else}
                      Additional Author Name
                    {/if}
                    {#if formFields.submitterName.required}
                      <span class="text-red-500" aria-label="required">*</span>
                    {/if}
                  </label>
                  <input
                    type="text"
                    id="submitterName_{index + 1}"
                    name="submitterName_{index + 1}"
                    required={formFields.submitterName.required}
                    aria-required={formFields.submitterName.required}
                    value={form?.values?.[`submitterName_${index + 1}`] || ''}
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={index === 0 && (formFields.submitterName.min || 1) === 1 ? "What should we call you?" : `What should we call author ${index + 1}?`}
                  />
                {/each}
                
                <!-- Show "more authors" link if applicable -->
                {#if shouldShowAuthorLink && !showAuthorDropdown}
                  <button
                    type="button"
                    on:click={handleShowAuthorDropdown}
                    class="text-blue-600 hover:text-blue-800 text-xs font-medium block ml-auto -mb-4"
                    aria-describedby="more-authors-help"
                  >
                    {authorLinkText}
                  </button>
                  <div id="more-authors-help" class="sr-only">
                    Click to add fields for additional authors
                  </div>
                {/if}
              </div>
              
              <!-- Show dropdown when "more authors" is clicked -->
              {#if showAuthorDropdown}
                <div class="mt-4">
                  <label for="authorCount" class="block text-sm font-medium text-gray-700 mb-2">
                    Total Number of Authors
                  </label>
                  <select
                    id="authorCount"
                    name="authorCount"
                    bind:value={selectedAuthorCount}
                    on:change={(e) => console.log('Select changed to:', e.target.value, typeof e.target.value)}
                    class="block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    aria-describedby="author-count-help"
                  >
                    {#each Array.from({ length: (formFields?.submitterName?.max || 5) - (formFields?.submitterName?.min || 1) + 1 }, (_, i) => (formFields?.submitterName?.min || 1) + i) as count}
                      <option value={count} selected={count === selectedAuthorCount}>
                        {count} author{count === 1 ? '' : 's'}
                      </option>
                    {/each}
                  </select>
                  <div id="author-count-help" class="text-sm text-gray-600 mt-1">
                    Select how many authors to include in this submission
                  </div>
                  
                  <!-- Option to go back -->
                  <div class="mt-2">
                    <button
                      type="button"
                      on:click={() => {
                        showAuthorDropdown = false;
                        selectedAuthorCount = formFields.submitterName.min || 1;
                      }}
                      class="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      ← Back 
                    </button>
                  </div>
                </div>
              {/if}
            {/if}
          {/if}

          <!-- 2. Email -->
          {#if formFields.submitterEmail?.visible}
            <div class="space-y-6">
            <!-- Primary Email Field -->
            <div>
              <label for="submitterEmail" class="block text-sm font-medium text-gray-700 mb-2">
                Email
                {#if formFields.submitterEmail.required}
                  <span class="text-red-500" aria-label="required">*</span>
                {/if}
              </label>
              <input
                type="email"
                id="submitterEmail"
                name="submitterEmail"
                bind:value={emailValue}
                required={formFields.submitterEmail.required}
                aria-required={formFields.submitterEmail.required}
                aria-describedby={emailFormatError ? 'email-format-error' : undefined}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {emailFormatError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}"
                placeholder="How can we reach you? (Please provide a single email address)"
              />
              
              {#if emailFormatError}
                <p id="email-format-error" class="text-red-600 text-sm mt-1" role="alert" aria-live="polite">
                  Please enter a valid email address
                </p>
              {/if}
            </div>

              <!-- Email Confirmation Field -->
              <div>
                <label for="confirmEmail" class="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Email
                  {#if formFields.submitterEmail.required}
                    <span class="text-red-500" aria-label="required">*</span>
                  {/if}
                </label>
                <input
                  type="email"
                  id="confirmEmail"
                  name="confirmEmail"
                  bind:value={confirmEmailValue}
                  required={formFields.submitterEmail.required}
                  aria-required={formFields.submitterEmail.required}
                  aria-describedby={emailMismatch ? 'email-mismatch-error' : undefined}
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {emailMismatch ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}"
                  placeholder="Please confirm your email"
                />

                {#if emailMismatch && confirmEmailValue}
                  <p id="email-mismatch-error" class="text-red-600 text-sm mt-1" role="alert" aria-live="polite">
                    Emails do not match
                  </p>
                {/if}
              </div>
            </div>
          {/if}

          <!-- 3. Number of Pieces & Titles -->
          {#if formFields.piecesPerSubmission?.visible}
            {#if !formFields.piecesPerSubmission.allowMultiple}
              <!-- Single Piece (allowMultiple = false) -->
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                  Title
                  {#if formFields.submitterTitle?.required}
                    <span class="text-red-500" aria-label="required">*</span>
                  {/if}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required={formFields.submitterTitle?.required}
                  aria-required={formFields.submitterTitle?.required}
                  value={form?.values?.title || ''}
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter your title"
                />
              </div>
            {:else}

              <!-- Multiple Pieces Allowed -->
              <!-- Number of Pieces Dropdown -->
              <div class="mb-4">
                <label for="piecesCount" class="block text-sm font-medium text-gray-700 mb-2">
                  Number of Pieces in this submission
                  {#if formFields.piecesPerSubmission.required}
                    <span class="text-red-500" aria-label="required">*</span>
                  {/if}
                </label>
                <select
                  id="piecesCount"
                  name="piecesCount"
                  bind:value={selectedPiecesCount}
                  required={formFields.piecesPerSubmission.required}
                  aria-required={formFields.piecesPerSubmission.required}
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {#each Array.from({ length: formFields.piecesPerSubmission.max - formFields.piecesPerSubmission.min + 1 }, (_, i) => formFields.piecesPerSubmission.min + i) as count}
                    <option value={count}>
                      {count} piece{count === 1 ? '' : 's'}
                    </option>
                  {/each}
                </select>
              </div>

              <!-- Title Fields (one for each piece) -->
              <div>
                {#each Array.from({length: selectedPiecesCount}) as _, index}
                  <label for="title_{index + 1}" class="block text-sm font-medium text-gray-700 mt-6 mb-2">
                    {#if selectedPiecesCount === 1}
                      Title
                    {:else}
                      Title {index + 1}
                    {/if}
                    {#if formFields.submitterTitle?.required}
                      <span class="text-red-500" aria-label="required">*</span>
                    {/if}
                  </label>
                  <input
                    type="text"
                    id="title_{index + 1}"
                    name="title_{index + 1}"
                    required={formFields.submitterTitle?.required}
                    aria-required={formFields.submitterTitle?.required}
                    value={form?.values?.[`title_${index + 1}`] || ''}
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={selectedPiecesCount === 1 ? "Enter your title" : `Enter title for piece ${index + 1}`}
                  />
                {/each}
                
                <!-- Live region for pieces count changes -->
                <div class="sr-only" aria-live="polite" aria-atomic="true">
                  {#if selectedPiecesCount > 1}
                    {selectedPiecesCount} title fields are now available
                  {:else}
                    One title field is now available
                  {/if}
                </div>
              </div>
            {/if}
          {/if}

          <!-- 4. Word Count -->
          {#if formFields.wordCount?.visible}
            <div>
              <label for="wordCount" class="block text-sm font-medium text-gray-700 mb-2">
                Word Count
                {#if formFields.wordCount.required}
                  <span class="text-red-500" aria-label="required">*</span>
                {/if}
                {#if formFields.wordCount.min || formFields.wordCount.max}
                  <span class="text-gray-500 text-sm font-normal">
                    ({formFields.wordCount.min && formFields.wordCount.max 
                      ? `${formFields.wordCount.min}-${formFields.wordCount.max}` 
                      : formFields.wordCount.min 
                        ? `minimum ${formFields.wordCount.min}` 
                        : `maximum ${formFields.wordCount.max}`} words)
                  </span>
                {/if}
              </label>
              <input
                type="number"
                id="wordCount"
                name="wordCount"
                bind:value={wordCountValue}
                required={formFields.wordCount.required}
                aria-required={formFields.wordCount.required}
                aria-describedby={wordCountError ? 'wordCount-error' : (formFields.wordCount.min || formFields.wordCount.max) ? 'wordCount-hint' : undefined}
                min={formFields.wordCount.min || undefined}
                max={formFields.wordCount.max || undefined}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {wordCountError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}"
                placeholder={formFields.wordCount.max ? `Up to ${formFields.wordCount.max} words` : 'Word count'}
              />

              {#if formFields.wordCount.min || formFields.wordCount.max}
                <div id="wordCount-hint" class="text-gray-500 text-sm mt-1">
                  {formFields.wordCount.min && formFields.wordCount.max 
                    ? `Enter between ${formFields.wordCount.min} and ${formFields.wordCount.max} words` 
                    : formFields.wordCount.min 
                      ? `Minimum ${formFields.wordCount.min} words` 
                      : `Maximum ${formFields.wordCount.max} words`}
                </div>
              {/if}

              {#if wordCountError}
                <div id="wordCount-error" class="text-red-600 text-sm mt-1" role="alert" aria-live="polite">
                  {wordCountError}
                </div>
              {/if}
            </div>
          {/if}

          <!-- 5. Offer Feedback -->
          {#if formFields.offerFeedback?.visible}
            <fieldset class="space-y-3">
              <legend class="block text-sm font-medium text-gray-700">
                Would you like feedback on your submission?
                {#if formFields.offerFeedback.required}
                  <span class="text-red-500" aria-label="required">*</span>
                {/if}
              </legend>
              
              <div class="space-y-2">
                <label class="flex items-start">
                  <input
                    type="radio"
                    name="offerFeedback"
                    value="yes"
                    required={formFields.offerFeedback.required}
                    checked={form?.values?.offerFeedback === 'yes'}
                    class="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span class="ml-3 text-sm text-gray-900">
                    Yes, I would like feedback if possible
                  </span>
                </label>
                
                <label class="flex items-start">
                  <input
                    type="radio"
                    name="offerFeedback"
                    value="no"
                    required={formFields.offerFeedback.required}
                    checked={form?.values?.offerFeedback === 'no'}
                    class="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span class="ml-3 text-sm text-gray-900">
                    No feedback requested
                  </span>
                </label>
              </div>
            </fieldset>
          {/if}

          <!-- 6. Cover Letter -->
          {#if formFields.coverLetter?.visible}
            <div>
              <label for="coverLetter" class="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter
                {#if formFields.coverLetter.required}
                  <span class="text-red-500" aria-label="required">*</span>
                {/if}
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                rows="10"
                required={formFields.coverLetter.required}
                aria-required={formFields.coverLetter.required}
                value={form?.values?.coverLetter || ''}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Your cover letter"
              ></textarea>
            </div>
          {/if}

          <!-- 7. File Upload -->
          {#if formFields.fileUpload?.visible}
            <div>
              <label for="fileUpload" class="block text-sm font-medium text-gray-700 mb-2">
                File Upload
                {#if formFields.fileUpload.required}
                  <span class="text-red-500" aria-label="required">*</span>
                {/if}
              </label>
              <input
                type="file"
                id="fileUpload"
                name="fileUpload"
                on:change={validateFile}
                required={formFields.fileUpload.required}
                aria-required={formFields.fileUpload.required}
                aria-describedby={fileError ? 'file-error' : 'file-help'}
                accept=".doc,.docx,.rtf,.odt"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 {fileError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}"
              />
              <p id="file-help" class="mt-1 text-sm text-gray-500">
                DOC, DOCX, RTF, or ODT files only (max 1MB)
              </p>
              {#if fileError}
                <p id="file-error" class="text-red-600 text-sm mt-1" role="alert" aria-live="polite">
                  {fileError}
                </p>
              {/if}
            </div>
          {/if}

          <div class="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || emailMismatch || emailFormatError || wordCountError || fileError}
              aria-describedby={isSubmitting ? 'submit-status' : undefined}
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isSubmitting}
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              {:else}
                Submit
              {/if}
            </button>

            {#if isSubmitting}
              <div id="submit-status" class="sr-only" aria-live="assertive">
                Please wait, your submission is being processed
              </div>
            {/if}
          </div>
        </div>
      </form>
    </div>
    </main>
  </div>
</div>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only:focus,
.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
</style>