const isCloudinaryUrl = (url) =>
  typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/upload/');

export const getOptimizedCloudinaryUrl = (url, options = {}) => {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const [prefix, suffix] = url.split('/upload/');
  if (!prefix || !suffix) {
    return url;
  }

  const segments = suffix.split('/');
  const firstSegment = segments[0] || '';
  const hasExistingTransformations = !/^v\d+$/.test(firstSegment);

  const existingTransformations = hasExistingTransformations
    ? firstSegment.split(',').filter(Boolean)
    : [];

  if (hasExistingTransformations) {
    segments.shift();
  }

  const transformationSet = new Set(existingTransformations);
  transformationSet.add('f_auto');
  transformationSet.add('q_auto');

  if (options.width) {
    transformationSet.add(`w_${Math.round(options.width)}`);
  }
  if (options.height) {
    transformationSet.add(`h_${Math.round(options.height)}`);
  }
  if (options.crop) {
    transformationSet.add(`c_${options.crop}`);
  }
  if (options.gravity) {
    transformationSet.add(`g_${options.gravity}`);
  }

  return `${prefix}/upload/${Array.from(transformationSet).join(',')}/${segments.join('/')}`;
};
