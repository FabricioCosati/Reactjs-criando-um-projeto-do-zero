import * as prismic from '@prismicio/client';
import sm from "../../sm.json"

export const endpoint = sm.apiEndpoint;
export const repositoryName = prismic.getRepositoryName(endpoint)

export const linkResolver = (doc) => {
  if (doc.type === 'post') {
    return `/post/${doc.uid}`;
  }
  return "/";
}

export const createClient = () => {
  const client = prismic.createClient(endpoint)

  return client
}