import React from 'react';

export default function Image({ src, alt, ...props }: any) {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img src={src} alt={alt} {...props} />;
}
