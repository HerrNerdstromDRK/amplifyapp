// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { BlogPost } = initSchema(schema);

export {
  BlogPost
};