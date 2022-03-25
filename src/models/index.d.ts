import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type BlogPostMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class BlogPost {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<BlogPost, BlogPostMetaData>);
  static copyOf(source: BlogPost, mutator: (draft: MutableModel<BlogPost, BlogPostMetaData>) => MutableModel<BlogPost, BlogPostMetaData> | void): BlogPost;
}