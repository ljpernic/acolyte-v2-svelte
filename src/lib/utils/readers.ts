export async function getAlertDesignees(): Promise<string[]> {
  try {
    const response = await fetch('/dashboard/api/readers?alertDesignee=true');
    if (!response.ok) throw new Error('Failed to fetch alert designees');
    
    const data = await response.json();
    const designees = data.readers; // Extract the readers array
    
    if (!Array.isArray(designees)) {
      console.error('Expected readers array, got:', data);
      return ['EIC']; // Fallback
    }
    
    // Since your API already returns string IDs, just return them directly
    return designees;
  } catch (error) {
    console.error('Error fetching alert designees:', error);
    return ['EIC']; // Fallback
  }
}

// Function to get emails for readers designated as Alert Designees 
export async function getAlertDesigneeEmails(): Promise<string[]> {
  try {
    const response = await fetch('/dashboard/api/readers?alertDesignee=true&includeEmails=true');
    if (!response.ok) throw new Error('Failed to fetch alert designee emails');
    
    const data = await response.json();
    const designees = data.readers;
    
    if (!Array.isArray(designees)) {
      console.error('Expected readers array, got:', data);
      return []; // Fallback
    }
    
    // Extract just the email addresses
    return designees.map(user => user.email).filter(email => email);
  } catch (error) {
    console.error('Error fetching alert designee emails:', error);
    return []; // Fallback
  }
}