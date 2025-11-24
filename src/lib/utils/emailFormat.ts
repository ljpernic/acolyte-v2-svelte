export function formatNames(names: string | string[]): string {
  if (!names) return 'Writer';
  
  if (Array.isArray(names)) {
    if (names.length === 0) return 'Writer';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
  }
  
  return names;
}

export function formatTitles(titles: string | string[] | undefined): string {
  if (!titles) return '';
  
  if (Array.isArray(titles)) {
    if (titles.length === 0) return '';
    if (titles.length === 1) return ` "${titles[0]}"`;
    if (titles.length === 2) return ` "${titles[0]}" and "${titles[1]}"`;
    return ` "${titles.slice(0, -1).join('", "')}", and "${titles[titles.length - 1]}"`;
  }
  
  return ` "${titles}"`;
}

export function formatTitlesForSubject(titles: string | string[] | undefined, maxLength: number = 40): string {
  if (!titles) return 'Submission Received';
  
  if (Array.isArray(titles)) {
    if (titles.length === 0) return 'Submission Received';
    
    const firstTitle = titles[0];
    
    // If just one title, truncate if needed
    if (titles.length === 1) {
      return firstTitle.length > maxLength 
        ? `${firstTitle.substring(0, maxLength - 3)}...`
        : firstTitle;
    }
    
    // Multiple titles: show first title + count
    const otherCount = titles.length - 1;
    const suffix = ` and ${otherCount} other${otherCount > 1 ? 's' : ''}`;
    const availableLength = maxLength - suffix.length;
    
    if (firstTitle.length > availableLength) {
      return `${firstTitle.substring(0, availableLength - 3)}...${suffix}`;
    }
    
    return `${firstTitle}${suffix}`;
  }
  
  // Single string title
  return titles.length > maxLength 
    ? `${titles.substring(0, maxLength - 3)}...`
    : titles;
}

export function getSubmissionTypeDisplay(type: string, hasMultipleTitles: boolean): string {
  const typeMap: Record<string, { singular: string; plural: string }> = {
    'fiction': { singular: 'fiction', plural: 'fiction pieces' },
    'poetry': { singular: 'poetry', plural: 'poems' },
    'nonfiction': { singular: 'nonfiction', plural: 'nonfiction pieces' },
    'art': { singular: 'art submission', plural: 'art submissions' },
    'other': { singular: 'submission', plural: 'submissions' }
  };
  
  const typeInfo = typeMap[type] || { singular: 'submission', plural: 'submissions' };
  return hasMultipleTitles ? typeInfo.plural : typeInfo.singular;
}