import React, { useState, useEffect } from "react";
import "./App.css";

import { Amplify, API } from "aws-amplify";

import { listBlogPosts } from "./graphql/queries";
import {
  createBlogPost as createBlogPostMutation,
  deleteBlogPost as deleteBlogPostMutation,
  updateBlogPost as updateBlogPostMutation,
} from "./graphql/mutations.js";

import {
  useTheme,
  useAuthenticator,
  withAuthenticator,
  Authenticator,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Flex,
  Grid,
  Heading,
  ScrollView,
  Image,
  Text,
  TextAreaField,
  View,
} from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const blogInitialFormState = { title: "Blog Title", content: "Blog Content" };

const imageURL = "https://picsum.photos/200";

export default function Home() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogFormData, setBlogFormData] = useState(blogInitialFormState);
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  // viewBlogPost refers to the blogPost currently in the view pane
  // It is empty by default, but when changed will trigger a state update and redraw.
  // Once set, a viewBlogPost will always be set unless all blog posts are deleted.
  const [viewBlogPost, setViewBlogPost] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateId, setUpdateId] = useState(0);

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
        updateId
    );
    const inputVar = {
      id: updateId,
      title: blogFormData.title,
      content: blogFormData.content,
    };

    await API.graphql({
      query: updateBlogPostMutation,
      variables: { input: inputVar },
    });

    // If the blog being updated is also being viewed, update the view also
    if (updateId === viewBlogPost.id) {
      setViewBlogPost(blogFormData);
    }

    // Update all of the blog posts in the Card pane
    fetchBlogPosts();

    // Reset the data area being used to track changes
    setBlogFormData(blogInitialFormState);

    // Clear Id of the post being updated
    setUpdateId(0);

    // Stop the update process
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
    if (viewBlogPost.id === id) setViewBlogPost([]);
  }

  /**
   * This method notifies the DOM/vDOM that the user has requested a change, specifically
   * to update a blog post.
   * This should trigger a re-render of the blogContentTextAreaField and change the button name
   * and title and content.
   */
  async function initiateBlogPostUpdate(blogPost) {
    console.log(
      "initiateBlogPostUpdate> blogPost.id: " +
        blogPost.id +
        ", blogPost.title: " +
        blogPost.title +
        ", blogPost.content: " +
        blogPost.content
    );
    setIsUpdate(true);
    setBlogFormData(blogPost);
    setUpdateId(blogPost.id);
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
          rows="8"
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

  /**
   * Build and return a Card wrapping a single blogPost.
   * @param {*} blogPost: The individual blog post to wrap in the Card.
   * @returns
   */
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
                  Created: {new Date(blogPost.createdAt).toString()}
                </Badge>
              </Flex>
              <Heading
                variation="quiet"
                maxLength={100}
                isReadOnly={true}
                level={5}
              >
                {blogPost.title}
              </Heading>
              <TextAreaField
                variation="quiet"
                maxLength={100}
                rows={2}
                wrap="wrap"
                width="500px"
                isReadOnly={true}
                as="span"
              >
                {blogPost.content.length > 100
                  ? blogPost.content.substring(0, 99) + "..."
                  : blogPost.content}
              </TextAreaField>
              <ButtonGroup justification="center" variation="primary">
                <Button size="small" onClick={() => deleteBlogPost(blogPost)}>
                  Delete Blog Post
                </Button>
                <Button
                  size="small"
                  isDisabled={isUpdate}
                  onClick={() => initiateBlogPostUpdate(blogPost)}
                >
                  Update Blog Post
                </Button>
                <Button size="small" onClick={() => setViewBlogPost(blogPost)}>
                  View Blog Post
                </Button>
              </ButtonGroup>
            </Flex>
          </Flex>
        </Card>
      </View>
    );
  }

  /**
   * Return the header to be used for each blog page.
   */
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
    console.log("renderCreateOrUpdateBlogView> isUpdate: " + isUpdate);
    console.log(
      "renderCreateOrUpdateBlogView> updateId: " +
        updateId +
        ", blogFormData.title: " +
        blogFormData.title +
        ", blogFormData.content: " +
        blogFormData.content
    );
    return (
      <div className="App">
        <input
          onChange={(e) =>
            setBlogFormData({
              ...blogFormData,
              title: e.target.value,
            })
          }
          placeholder="Blog Title"
          value={blogFormData.title}
        />
        {blogContentTextAreaField(blogFormData.content)}
        <Button
          variation="primary"
          size="small"
          onClick={isUpdate ? updateBlogPost : createBlogPost}
        >
          {isUpdate ? "Update Blog Post" : "Create Blog Post"}
        </Button>
      </div>
    );
  };

  const { tokens } = useTheme();

  return (
    <Grid
      templateColumns={{ base: "1fr", large: "1fr 1fr" }}
      templateRows={{ base: "repeat(4, 10rem)", large: "repeat(3, 10rem)" }}
      gap="var(--amplify-space-small)"
    >
      <View
        columnSpan={2}
        backgroundColor={tokens.colors.background.secondary}
        padding={tokens.space.medium}
      >
        {getBlogHeader()}
      </View>
      <View
        rowSpan={2}
        backgroundColor={tokens.colors.background.secondary}
        padding={tokens.space.medium}
      >
        {blogPosts.map((blogPost) => BlogPostCard(blogPost))}
      </View>
      <ScrollView
        orientation="vertical"
        backgroundColor={tokens.colors.background.secondary}
        padding={tokens.space.medium}
      >
        <Text>Title: {viewBlogPost.title}</Text>
        <Text>Content: {viewBlogPost.content}</Text>
      </ScrollView>
      <View
        backgroundColor={tokens.colors.background.secondary}
        padding={tokens.space.medium}
      >
        {renderCreateOrUpdateBlogView()}
      </View>
    </Grid>
  );
}
