export const faqs = [
  {
    title: 'First thing?',
    answer: `<p class="text-gray-600 dark:text-gray-300">
    First thing first thing first thing!
  </p>`
  },
  {
    title: 'Second thing?',
    answer: `<p class="text-gray-600 dark:text-gray-300">
    Second thing second thing second thing!
  </p>`
  }
];

export const menus = [
  {
    title: 'Resources',
    links: [
      { className: 'mb-4', href: '/', item: 'Flowbite' },
      { className: 'mb-4', href: '/', item: 'Figma' },
      { className: 'mb-4', href: '/', item: 'Tailwind CSS' },
      { className: 'mb-4', href: '/', item: 'Blog' },
      { className: 'mb-4', href: '/', item: 'Blocks' }
    ]
  },
  {
    title: 'Help and support',
    links: [
      { className: 'mb-4', href: '/', item: 'GitHub Repository' },
      { className: 'mb-4', href: '/', item: 'Flowbite Library' }
    ]
  },
  {
    title: 'Follow us',
    links: [
      { className: 'mb-4', href: '/', item: 'GitHub' },
      { className: 'mb-4', href: '/', item: 'Twitter' },
      { className: 'mb-4', href: '/', item: 'Facebook' },
      { className: 'mb-4', href: '/', item: 'LinkedIn' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { className: 'mb-4', href: '/', item: 'Privacy Policy' },
      { className: 'mb-4', href: '/', item: 'Terms & Conditions' },
      { className: 'mb-4', href: '/', item: 'EULA' }
    ]
  }
];

export const rows = [
  { name: 'Seperate business/personal', freelancer: true, company: true, enterprise: true },
  { name: 'Estimate tax payments', freelancer: true, company: true, enterprise: true },
  { name: 'Stock control', freelancer: true, company: true, enterprise: true },
  { name: 'Create invoices & estimates', freelancer: false, company: true, enterprise: true },
  { name: 'Manage bills & payments', freelancer: false, company: true, enterprise: true },
  { name: 'Run payroll', freelancer: false, company: true, enterprise: true },
  { name: 'Handle multiple currencies', freelancer: false, company: false, enterprise: true },
  {
    name: 'Number of Users',
    freelancer: '1 User',
    company: '5-10 Users',
    enterprise: '20+ Users'
  },
  { name: 'Track deductible mileage', freelancer: false, company: false, enterprise: true },
  { name: 'Track employee time', freelancer: false, company: false, enterprise: true },
  { name: 'Multi-device', freelancer: false, company: false, enterprise: true }
];

export const prices: string[][] = [
  ['$24', '$200'],
  ['$49', '$400'],
  ['$499', '$1500']
];

export const brand = {
  href: 'https://acolyte.media',
  src: '/images/acolyte-icon-logo.png',
  alt: 'Acolyte Submission System Logo',
  name: 'Acolyte Submission System'
};
