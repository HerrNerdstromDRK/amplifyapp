
import React, { useState, useEffect } from 'react';
import './App.css';

import { Amplify } from 'aws-amplify';
import { API, Storage } from 'aws-amplify';

import { Authenticator, withAuthenticator, /*useAuthenticator*/ } from '@aws-amplify/ui-react';
import { Flex, Text, Divider } from '@aws-amplify/ui-react';

import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations.js'

import { listBlogPosts } from './graphql/queries' ;
import { createBlogPost as createBlogPostMutation /*, deleteBlogPost as deleteNoteMutation */ } from './graphql/mutations.js';

import { TextAreaField } from '@aws-amplify/ui-react';

import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

const initialFormState = { name: '', description: '' }
const blogInitialFormState = { title: 'Blog Title', content: 'Blog Content' }

function App({ signOut, user })
{
 const [blogPosts, setBlogPosts] = useState([]) ;
 const [blogFormData, setBlogFormData] = useState(blogInitialFormState) ;

 const [notes, setNotes] = useState([]);
 const [formData, setFormData] = useState(initialFormState);

 // useEffect() is called whenever the DOM is updated
 // Use it here to refresh our display
  useEffect(() => {
    fetchNotes();
	fetchBlogPosts() ;
  }, []);

	async function onChange(e)
	{
	  if (!e.target.files[0]) return
	  const file = e.target.files[0];
	  setFormData({ ...formData, image: file.name });
	  await Storage.put(file.name, file);
	  fetchNotes();
	}

	async function fetchNotes()
	{
	  const apiData = await API.graphql({ query: listNotes });
	  const notesFromAPI = apiData.data.listNotes.items;
	  await Promise.all(notesFromAPI.map(async note => {
	    if (note.image) {
	      const image = await Storage.get(note.image);
	      note.image = image;
	    }
	    return note;
	  }))
	  setNotes(apiData.data.listNotes.items);
	}

	/**
	 * Retrieve all blog posts from the API and display to the user.
	 */
	async function fetchBlogPosts()
	{
		console.log( "fetchBlogPosts" ) ;
		// Run the listBlogPosts() query from the GraphQL API to retrieve all current
		//  blog posts
		const apiData = await API.graphql({query: listBlogPosts}) ;

		// Convenience variable to store all of the blog post items
		const blogPostsFromAPI = apiData.data.listBlogPosts.items ;

		// Update the local cop of the blogPosts using the API pull
		setBlogPosts( blogPostsFromAPI ) ;
	}

	/**
	 * Use data currently in the blog entry fields to create a new blog entry.
	 * @returns N/A
	 */
	async function createBlogPost()
	{
		console.log( 'createBlogPost> title: ' + blogFormData.title + ', content: ' + blogFormData.content ) ;
		if( !blogFormData.title || !blogFormData.content ) return ;
//		console.log( 'createBlogPost> Going to graphql, blogFormData: ' + blogFormData.content ) ;
		await API.graphql({ query: createBlogPostMutation, variables: {input: blogFormData }}) ;
		setBlogPosts([ ...blogPosts, blogFormData ]) ;
//		console.log( 'createBlogPost> blogPosts: ' + blogPosts ) ;
		setBlogFormData( blogInitialFormState ) ;
		console.log( 'createBlogPost> blogInitialFormState: {' + blogInitialFormState.title + ', ' + blogInitialFormState.content + '}' ) ;
		console.log( 'createBlogPost> blogFormData: {' + blogFormData.title + ', ' + blogFormData.content + '}' ) ;
	}

	async function createNote() {
		console.log( "createNote> name: " + formData.name + ", description: " + formData.description ) ;
	  if (!formData.name || !formData.description) return;
	  await API.graphql({ query: createNoteMutation, variables: { input: formData } });
if (formData.image) {
	    const image = await Storage.get(formData.image);
	    formData.image = image;
	  }
	  setNotes([ ...notes, formData ]);
	  setFormData(initialFormState);
	}

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }
  
 const blogContentTextAreaField = () => {
	return (
		<Flex as="form" direction="column">
			<TextAreaField
				autoComplete="off"
				direction="row"
				defaultValue="Default Blog Content"
				hasError={false}
				isDisabled={false}
				isReadOnly={false}
				isRequired={false}
				label="Blog Content"
				labelHidden={false} 
				name="blogContent"
				placeholder="Blog Content Goes Here :)"
				rows="3"
				wrap="wrap"
				resize="vertical"
				onChange={e => setBlogFormData({ ...blogFormData, 'content': e.currentTarget.value})}
			/>
    </Flex>
	) ;
}

  return (
    <Authenticator>
     {({ signOut, user }) => (
	<>
      <div className="App">
	      <Flex direction="column">
	      	<Text>
              <h1>Yoda Blog</h1>
              Welcome {user.username}!
              <p>
              <button onClick={signOut}>Sign Out</button>
              </p>
              </Text>
    	   <Divider /> 
      <Text>
	  <input
        onChange={e => setBlogFormData({ ...blogFormData, 'title': e.target.value})}
        placeholder="Blog Title"
        value={blogFormData.title}
      />
	{ blogContentTextAreaField() }

  		<button onClick={createBlogPost}>Create Blog Post</button>
		  </Text>
		  <Divider />
		  <Text>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
	  <input
	  	type="file"
	  	onChange={onChange}
	  />
      <button onClick={createNote}>Create Note</button>
      </Text>
      <Divider />
      <Text>
      <div style={{marginBottom: 30}}>
		{
		  blogPosts.map(blogPost => (
		    <div key={blogPost.id || blogPost.title}>
		      <h2>{blogPost.title}</h2>
		      <p>{blogPost.content}</p>
		    </div>
		  ))
		}
      </div>
</Text>
		  <Divider />
		  <Text>
      <div style={{marginBottom: 30}}>
		{
		  notes.map(note => (
		    <div key={note.id || note.name}>
		      <h2>{note.name}</h2>
		      <p>{note.description}</p>
		      <button onClick={() => deleteNote(note)}>Delete note</button>
		      {
		        note.image && <img src={note.image} style={{width: 400}} alt="" />
		      }
		    </div>
		  ))
		}
      </div>

      </Text>
      </Flex>
    </div>
    </>
    )}
    </Authenticator>
  );
}
export default withAuthenticator(App)
