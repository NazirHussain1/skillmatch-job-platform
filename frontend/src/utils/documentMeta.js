export const setDocumentMeta = ({
  title = 'SkillMatch - Skill-Based Hiring Platform',
  description = 'Find jobs, manage applications, and hire qualified candidates through SkillMatch.',
  url = window.location.href
} = {}) => {
  document.title = title;

  const setMeta = (selector, attribute, value) => {
    const element = document.head.querySelector(selector);
    if (element) {
      element.setAttribute(attribute, value);
    }
  };

  setMeta('meta[name="title"]', 'content', title);
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[property="twitter:title"]', 'content', title);
  setMeta('meta[property="twitter:description"]', 'content', description);
  setMeta('meta[property="twitter:url"]', 'content', url);
};
