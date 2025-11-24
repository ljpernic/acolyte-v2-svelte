import type { LayoutServerLoad } from './$types';
// Remove this line completely:
// import { ANALYTICS_ID } from '$env/static/private';

const json = (r: Response) => r.json();
// export const prerender = true;

export const load: LayoutServerLoad = async ({ fetch }) => {
  try {
    const posts = await fetch('/api/posts').then(json);
    // console.log('posts: ', posts);
    return { posts }; // Remove ANALYTICS_ID from here
  } catch (error) {
    console.error(`Error in load function for /: ${error}`);
  }
};