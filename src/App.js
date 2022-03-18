import React, { useState, useEffect } from "react";
import "./App.css";

import { Amplify, API } from "aws-amplify";

import {
  Authenticator,
  withAuthenticator /*useAuthenticator*/,
} from "@aws-amplify/ui-react";

import { listBlogPosts } from "./graphql/queries";
import {
  createBlogPost as createBlogPostMutation,
  deleteBlogPost as deleteBlogPostMutation,
  updateBlogPost as updateBlogPostMutation,
} from "./graphql/mutations.js";

import {
  Button,
  Card,
  Flex,
  Grid,
  Image,
  View,
  Heading,
  Badge,
  Text,
  TextAreaField,
  useTheme,
} from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const blogInitialFormState = { title: "Blog Title", content: "Blog Content" };

const imageURL = "https://picsum.photos/200";

function App({ signOut, user }) {
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogFormData, setBlogFormData] = useState(blogInitialFormState);
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateBlogPostInstance, setUpdateBlogPostInstance] =
    useState(blogInitialFormState);

  // useEffect() is called whenever the DOM is updated
  // Use it here to refresh our display
  useEffect(() => {
    fetchBlogPosts();
  }, []);

  /**
   * Retrieve all blog posts from the API and display to the user.
   */
  async function fetchBlogPosts() {
    console.log("fetchBlogPosts");
    // Run the listBlogPosts() query from the GraphQL API to retrieve all current
    //  blog posts
    const apiData = await API.graphql({ query: listBlogPosts });

    // Convenience variable to store all of the blog post items
    const blogPostsFromAPI = apiData.data.listBlogPosts.items;

    // Update the local cop of the blogPosts using the API pull
    setBlogPosts(blogPostsFromAPI);
  }

  /**
   * Use data currently in the blog entry fields to create a new blog entry.
   * @returns N/A
   */
  async function createBlogPost() {
    console.log(
      "createBlogPost> title: " +
        blogFormData.title +
        ", content: " +
        blogFormData.content
    );
    if (!blogFormData.title || !blogFormData.content) return;
    //		console.log( 'createBlogPost> Going to graphql, blogFormData: ' + blogFormData.content ) ;
    await API.graphql({
      query: createBlogPostMutation,
      variables: { input: blogFormData },
    });
    setBlogPosts([...blogPosts, blogFormData]);
    //		console.log( 'createBlogPost> blogPosts: ' + blogPosts ) ;
    setBlogFormData(blogInitialFormState);
    console.log(
      "createBlogPost> blogInitialFormState: {" +
        blogInitialFormState.title +
        ", " +
        blogInitialFormState.content +
        "}"
    );
    console.log(
      "createBlogPost> blogFormData: {" +
        blogFormData.title +
        ", " +
        blogFormData.content +
        "}"
    );
  }

  async function updateBlogPost() {
    console.log(
      "updateBlogPost> title: " +
        blogFormData.title +
        ", content: " +
        blogFormData.content +
        ", id: " +
        updateBlogPostInstance.id
    );
    await API.graphql({
      query: updateBlogPostMutation,
      variables: {
        id: updateBlogPostInstance.id,
        title: updateBlogPostInstance.title,
        content: updateBlogPostInstance.content,
      },
    });
    setBlogPosts([...blogPosts, blogFormData]);
    setBlogFormData(blogInitialFormState);
    setIsUpdate(false);
  }

  async function deleteBlogPost({ id }) {
    const newBlogPostsArray = blogPosts.filter(
      (blogPost) => blogPost.id !== id
    );
    setBlogPosts(newBlogPostsArray);
    await API.graphql({
      query: deleteBlogPostMutation,
      variables: { input: { id } },
    });
  }

  /**
   * This method notifies the DOM/vDOM that the user has requested a change, specifically
   * to update a blog post.
   * This should trigger a re-render of the blogContentTextAreaField and change the button name
   * and title and content.
   */
  async function initiateBlogPostUpdate(blogPost) {
    console.log(
      "initiateBlogPostUpdate> blogPost.title: " +
        blogPost.title +
        ", blogPost.content: " +
        blogPost.content
    );
    setIsUpdate(true);
    setUpdateBlogPostInstance(blogPost);
  }

  function blogContentTextAreaField(blogPostContent) {
    console.log(
      "blogContentTextAreaField> blogPostContent: " + blogPostContent
    );
    return (
      <Flex as="form" direction="column">
        <TextAreaField
          autoComplete="off"
          direction="row"
          defaultValue={blogPostContent}
          hasError={false}
          isDisabled={false}
          isReadOnly={false}
          isRequired={false}
          label="Blog Content"
          labelHidden={false}
          name="blogContent"
          placeholder="Blog Content Goes Here :)"
          rows="3"
          value={blogPostContent}
          wrap="wrap"
          resize="vertical"
          onChange={(e) =>
            setBlogFormData({ ...blogFormData, content: e.currentTarget.value })
          }
        />
      </Flex>
    );
  }

  function BlogPostCard(blogPost) {
    const { tokens } = useTheme();
    //    console.log(
    //      "BlogPostCard> blogPost.title: " +
    //        blogPost.title +
    //        ", blogPost.content: " +
    //        blogPost.content
    //    );
    return (
      <View
        backgroundColor={tokens.colors.background.secondary}
        padding={tokens.space.medium}
      >
        <Card>
          <Flex direction="row" alignItems="flex-start">
            <Image
              alt="Road to milford sound"
              src={imageURL + "?random=" + blogPost.id}
              width="20%"
            />
            <Flex
              direction="column"
              alignItems="flex-start"
              gap={tokens.space.xs}
            >
              <Flex>
                <Badge size="small" variation="info">
                  Plus
                </Badge>
                <Badge size="small" variation="success">
                  Verified
                </Badge>
              </Flex>

              <Heading level={5}>{blogPost.title}</Heading>

              <Text as="span">{blogPost.content}</Text>
              <button onClick={() => deleteBlogPost(blogPost)}>
                Delete Blog Post
              </button>
              <button onClick={() => initiateBlogPostUpdate(blogPost)}>
                Update Blog Post
              </button>
            </Flex>
          </Flex>
        </Card>
      </View>
    );
  }

  const getBlogHeader = () => {
    return (
      <>
        <center>
          <Heading level={1}>Yoda Blog</Heading>
          <Text>Welcome {user.username}!</Text>
          <Button size="small" onClick={signOut}>
            Sign Out
          </Button>
        </center>
      </>
    );
  };

  /**
   * This method is called to choose whether the blog post text field area is
   * to be used to create a new blog post or modify an existing blog post.
   * In the former case, populate the fields with default title and content and
   * set the button as createBlogPost.
   * In the latter case, populate the fields with title and content from the
   * referenced blogPost and set the button to update the blog post.
   * @returns
   */
  const renderCreateOrUpdateBlogView = () => {
    console.log("renderCreateOrUpdateBlogView, isUpdate: " + isUpdate);
    if (isUpdate === true) {
      console.log(
        "renderCreateOrUpdateBlogView> updateBlogPost.title: " +
          updateBlogPostInstance.title +
          ", updateBlogPost.content: " +
          updateBlogPostInstance.content
      );
      return (
        <div className="App">
          <input
            onChange={(e) =>
              setBlogFormData({ ...blogFormData, title: e.target.value })
            }
            placeholder="Blog Title"
            value={updateBlogPostInstance.title}
          />
          {blogContentTextAreaField(updateBlogPostInstance.content)}
          <button onClick={updateBlogPost}>Update Blog Post</button>
        </div>
      );
    }
    // isUpdate is false, meaning this area should be used to create a new blog post
    else {
      return (
        <div className="App">
          <input
            onChange={(e) =>
              setBlogFormData({ ...blogFormData, title: e.target.value })
            }
            placeholder="Blog Title"
            value={blogFormData.title}
          />
          {blogContentTextAreaField(blogInitialFormState.content)}
          <button onClick={createBlogPost}>Create Blog Post</button>
        </div>
      );
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Grid
          templateColumns="1fr 1fr"
          templateRows="12rem 12rem 12rem"
          gap="var(--amplify-space-small)"
        >
          <View columnSpan={2} backgroundColor="var(--amplify-colors-blue-10)">
            {getBlogHeader()}
          </View>
          <View rowSpan={2} backgroundColor="var(--amplify-colors-blue-20)">
            {" "}
            <div style={{ marginBottom: 30 }}>
              {blogPosts.map((blogPost) => BlogPostCard(blogPost))}
            </div>
          </View>
          <View backgroundColor="var(--amplify-colors-blue-40)">
            {renderCreateOrUpdateBlogView()}
          </View>
        </Grid>
      )}
    </Authenticator>
  );
}
export default withAuthenticator(App);
