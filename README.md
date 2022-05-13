# Using NEAR with Arweave

Arweave is a permanent storage network, in which you pay once and your data is stored forever. The Bundler Network is a Layer 2 solution that provides the opportunity for many other chains to write data to Arweave without having to exchange their native token into AR and then send it to an AR Wallet to use to add data to the Arweave network. The Bundler Network allows you as a developer to securely fund a Bundler account with the native token of the blockchain the user has their wallet on. Then upload data using those funds, when complete, they can withdraw the balance of the bundler account back to their native token. This gives many chains the ability to store data along side their smart contracts with a feasible one time fee.

## Who is this tutorial for?

This tutorial is for NEAR Protocol developers that are interested in learning about Arweave and how to use the Bundler Network and Arweave to enable their DApps to store data permenantely on the Arweave network. 

## What do I need to know?

You will need to know standard web technologies, HTML, CSS, and JS, also you may need to know a little React (You can learn enough going through the docs - https://reactjs.org)

Technologies

* Git/Github
* HTML/CSS/Javascript
* React 
* NodeJS (https://nodejs.org)
* GraphQL
* ArweaveJS

## What do I need?

You will need an internet enabled computer, a code editor (https://code.visualstudio.com), a NEAR Wallet on mainet with 0.1 NEAR in the wallet.


## About the Tutorial

Lets learn by doing, in this tutorial we will take a public square app and add the ability to connect via a NEAR wallet, and implement the following features:

* Query Arweave for Public Square Posts
* Query Arweave for Public Square Posts by Topic
* Query Arweave for Public Square Posts by Owner
* Create a new Public Square Post on Arweave

## Topics

1. [Setup](setup)
2. [Querying Arweave using GraphQL](querying-arweave-using-graphql) (25-30 minutes)
3. [Integrating ArweaveJS](integrating-arweavejs) (25-30 minutes)
4. [Posting Transactions](posting-transactions) (25-30 minutes)
5. [Deploying to the Permaweb](deploying-to-the-permaweb) (25-30 minutes)

## Setup

The first thing we want to is pull down the public square repository so that we have a base project to start working. We can use https://github.com/twilson63/public-square-app as a good starting point.

```
git clone https://github.com/twilson63/public-square-app
cd public-square-app
npm install
npm start
```

> NOTE: This application was built by DMac https://github.com/DanMacDonald - 🙏🏻 this contribution, is helping many developers get on boarded to Arweave.


This is a React app and you should be able to go to `localhost:3000` and see the bare bones of the app. If you do, congrats, you are ready to take the next step.

## Querying Arweave using GraphQL

On Arweave, all data is posted as transactions. Each transaction has a set of attributes and some bytes of stored data associated with it. The data can be complete files, images, JSON, plain text, or encrypted data. The arweave nodes don't care. They just store the raw bytes associated with a transaction and earn their rewards by doing so.

Iterating block by block through all the transactions in the network to find or locate the transactions we are interested in would be a slow and tedious job. Thankfully, Arweave transaction headers are able to store up to 2048 bytes of custom Tags. 

### Tagging Transactions

Custom Tags are pairs of names and values. Like "App-Name": "PublicSquare" or "Topic": "Football". The Arweave protocol doesn't place many constraints on custom tags but there are some [suggested best practices](https://github.com/ArweaveTeam/arweave-standards/tree/master/best-practices) to help with consistency. 

For our Public Square dApp we're only interested in transactions tagged with "App-Name": "PublicSquare". Each one of these transactions represents a post from a user we want to display in our timeline. 

Arweave provides a mechanism in its gateways systems to query transactions using the headers or metadata of the transactions. In our case, we want to use the custom tags. The https://arweave.net gateway exposes an endpoint for posting GraphQL queries.

[GraphQL] is a flexible query language that services can use to build a customized data schema for clients to query. GraphQL also allows clients to specify which elements of the available data structure they would like to see in the results.

### Running a GraphQL query

GraphQL queries are executed by submitting an HTTP POST to a `/graphql` endpoint with a body containing a `query` property. This `query` property needs to contain a full structured GraphQL query. In order to develop your GraphQL query, a playground area is provided to allow developers to visually access the results of their queries. You can get to the playground of the Arweave gateway graphql server by opening a web browser to this url https://arweave.net/graphql. Using the GraphQL playground we can add our query on the left side of the window and then click the play button in the middle and see the results on the right side of the window. The results will always return as JSON.

Here is a GraphQL query that is requesting all of the transactions on Arweave that have a custom tag with a name of "App-Name" and a value of "PublicSquare".

``` graphql
query {
  transactions(tags: [{
    name: "App-Name",
    values: ["PublicSquare"]
  }]) 
  {
    edges {
      node {
        id
        tags {
          name
          value
        }
      }
    }
  }
}
```

GraphQL is a powerful and complex technology, it can feel overwhelming at first to get your head around how it works. One of the benefits of GraphQL is that any http request library can interact with GraphQL servers. This ability to use standard web technologies like `fetch` really comes in handy for working with it in your dApps. Here is a pattern of the GraphQL Query:

```
query {<schema type>( <filter criteria> ) { <data structure of the results > }
```

Getting familiar with the GraphQL playground and using its helper tools can also help you out with writing GraphQL queries. In the example query above, the schema type is `transactions`, the filter criteria is `tags: [{...}]`, and the result structure is `{ edges { node { ... } } `. A full description of Arweaves GraphQL schema is written up in the [Arweave GraphQL Guide](https://gql-guide.vercel.app/). The guide refers to the filter criteria as "Query Structures" and the complete data definition of transactions and blocks as "Data Structures".

When it comes to the structure of the results, the thing to note is that you can specify a subset of the complete data structure you're interested in. For example, the complete data structure for a transaction schema is [listed here](https://gql-guide.vercel.app/#full-data).

In our case we're interested in the `id` and the complete list of `tags` for any transaction matching our filter criteria.

By pasting the above example in to the playground and hitting the big run button in the middle of the window, you should see some PublicSquare posts appear on the left. The reason you see some results is this PublicSquare protocol is a very common on boarding process used widely in the Arweave ecosystem and developed by the [Arweave Team](https://twitter.com/arweaveteam) founder, Sam Williams, in a [github snippet](https://gist.github.com/samcamwilliams/811537f0a52b39057af1def9e61756b2).

You will notice, that GraphQL only returns the header properties of a transaction and not the actual data of the transaction. 

To get the data of a transaction, you will need to hit an endpoint on the gateway that returns the data of the transaction.

`https://arweave.net/<transaction id>`

If you want to see it in action, copy and paste one of the id's in the query results and create a new browser tab and type the following in the address URL input.

```
https://arweave.net/[paste tx id here]
```

So it could look like:

```
https://arweave.net/eaUAvulzZPrdh6_cHwUYV473OhvCumqT3K7eWI8tArk
```

And you should see in your browser: `Woah that's pretty cool 😎`

Alright, we have all the tools in our toolbox to start building our Public Square application.

> If you are interested in a complete list of HTTP endpoints for Arweave visit the [HTTP API documentation](https://docs.arweave.org/developers/server/http-api).

### Querying from javascript

Lets now head over to our project and open up your favorite code editor to navigate to the `src/lib/api.js` file. Update the `buildQuery` function to add our GraphQL query.

```
export const buildQuery = () => {
  const queryObject = { query: `
query {
	  transactions(first: 100, 
      tags: [
			  { name: "App-Name", values: ["PublicSquare"] },
				{ name: "Content-Type", values: ["text/plain"] }
		  ]
	) {
	  edges {
		  node {
			  id
				owner {
				  address
			  }
				data {
				  size
				}
				block {
				  height
					timestamp
				}
				tags {
				  name
					value
				}
			}
		}
	}
}
`}
	return queryObject
}
```

You'll notice that we've added an additional filter to the `tags` section of our query. We're now additionally looking for a `Content-Type` tag with the value "text/plain" on the `transactions` returned by our query.

> Why filter for the Content-Type, Arweave is an open platform so many applications use the PublicSquare protocol and we want to make sure our application only returns content that is of `text/plain`. 

## Integrating ArweaveJS

Inorder to execute our query in our application, we will need to add the ArweaveJS library to our project, we can install it from npm:

```
npm install arweave
```

For more information about the arweave library api, you can check out the project's [README](https://github.com/ArweaveTeam/arweave-js) file. For now, we only need two lines of code to begin interacting with arweave network. Open up the `src/lib/api.js` file in our project and add the following lines a the top of the file.

``` js
import Arweave from 'arweave';
export const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})
```

This will create an instance of the arweave api object with the default configuration pointing to https://arweave.net gateway. 

> Initializing Arweave in a single location in codebase will make for an easier time managing the ability to point to different gateway environments in the future.


### Querying the gateway

In your code editor, open the `src/App.js` file and lets import our `buildQuery` and `arweave` exports from `./lib/api`.

```
import { buildQuery, arweave } from './lib/api';
```

Then edit the `getPostInfos()` function

```
async function getPostInfos() {
 const query = buildQuery();
 const results = await arweave.api.post('graphql', query)
   .catch(err => {
     console.error('GraphQL query failed');
      throw new Error(err);
   });
 const edges = results.data.data.transactions.edges;
 console.log(edges);
 return [];
}
```

In this function, we invoke the buildQuery method to get our GraphQL query and then we use the `arweave.api.post` function to make an HTTP POST to the arweave gateway to execute our GraphQL query. The `arweave.api` module, handles the connection info to the gateway and parses the Response BODY into a nice JSON result. 

> You may notice that we are grabbing two data objects then transactions. This is because, the api utility takes the Response body and parses it into a `data` object, then the GraphQL query returns as part of the body a `data` object as the root object. So when getting the response from the server, you will have to always drill down into two `data` props.

You can check your developer console in the browser and you should see a hundred objects in an array. You can expand the first element and see our node data:

```
{
  "node": {
    "id": "1qtxYvjcIRVTR3aoiFbOp0ZMsheu420XtJB6ar5F3vw",
    "owner": {
      "address": "96c6IZq4pM0HTLthZsqIZUcRXQA3CqTFw4IZ5GK1_3s"
    },
    "data": {
      "size": "13"
    },
    "block": {
      "height": 932254,
      "timestamp": 1652377511
    },
    "tags": [
      {
        "name": "App-Name",
        "value": "PublicSquare"
      },
      {
        "name": "Content-Type",
        "value": "text/plain"
      },
      {
        "name": "Version",
        "value": "1.0.1"
      },
      {
        "name": "Type",
        "value": "post"
      },
      {
        "name": "Signing-Client",
        "value": "ArConnect"
      },
      {
        "name": "Signing-Client-Version",
        "value": "0.4.1"
      }
    ]
  }
}
```

> NOTE: that we are receiving 100 records because we specified in our query to get the first 100, 100 is the maximum results that arweave gateway will return in one request, if we did not specify 100, we would receive 10. We will use [pagination and cursors](https://gql-guide.vercel.app/#pagination) to return more results later in this tutorial.

Now that we are getting some results, lets format each node and display the transaction on the the web page. We will need to map each node from the result list into a transform function that converts each node into a `postData` object. You can look at our `createPostInfo` function in the `src/lib/api.js` file. This function takes a node object and returns a `postInfo` object.

```
export const createPostInfo = (node) => {
 const ownerAddress = node.owner.address;
 const height = node.block ? node.block.height : -1;
 const timestamp = node.block ? parseInt(node.block.timestamp, 10) * 1000 : -1;
 const postInfo = {
   txid: node.id,
   owner: ownerAddress,
   height: height,
   length: node.data.size,
   timestamp: timestamp,
 }
 return postInfo;
}
```

In this function, we are grabing the owner's address from the transaction node, every transaction must have an owner, and the owner will always have an address in the `owner.address` property. One note is to look at the `block` property, if this property is null, it means the transaction has not been mined yet, it is a pending transaction. Pending transactions are those that have been posted and cached to arweave but are waiting in what's known as the "mempool" for miners to include them in a block. Occasionally pending transactions are dropped. This can happen for a number of reasons. but the important thing to know is that after 30 blocks have passed a pending transaction is dropped. This means the user will have to try to post their data to arweave again. Hopefully correcting anything that might have been wrong the first time. Each block has a unix timestamp for the time it was mined. This can be handly letting you know roughly when the post was made. The arweave network attempts to mine blocks every 2 minutes. 

> Unix Timestamps are the number seconds since 1970 and Javascript timestamps are the number of milliseconds since 1970 

Transaction headers know the number of bytes of data associated with them. Even if GraphQL can't return the actual transaction data directly, we know from `node.data.size` how many characters/bytes it is. We'll use this to our advantage later in a UI optimization.

	Let's wire up our createPostInfo to transform our nodes that we received back from our GraphQL query. In the file `src/App.js`, include the `createPostInfo` in the import of `./lib/api` 
	
	```
	import { buildQuery, arweave, createPostInfo } from './lib/api'
	
	and lets change the return line in the `getPostInfos()` function to map over the edges coverting each node into a `postInfo` object:

```
return edges.map(edge => createPostInfo(edge.node))
```

### Managing state with React

Over in React land, keep the `src/App.js` file open and let's start adding some React state. We are going to use the `useState` hook to add two states to our component, `postInfos` and `isSearching`.

* The `postInfos` state is where we'll keep our array of `postInfo` items. React only rebinds views that use those items if the underlyin data changes. By storing it at the application level it allows us to navigate around the other areas of the UI without unloading our `postInfos`. 
* `isSearching` is a flag that controls the visibility of a loading spinner that will show while our query is running. 

Let's connect our `postInfos` query to the react `App` component using the `useEffect` hook. The `useEffect` hook is specifically setup to run during component mount or load.

``` 
React.useEffect(() => {
  setIsSearching(true)
	getPostInfos().then(posts => {
	  setPostInfos(posts)
		setIsSearching(false)
	})
}, [])
```

First let's take a quick look at `useEffect()` as it's relatively recent addition to React. 

`useEffect(<function to execute>, [<state items that triggers the execution of this function during a re-rendering event>]}`

* The function to execute is the work we want done by `useEffect()`.
* The second argument is the array of state variables that (like the `postInfos` and `isSearching` variables we initialized with `useState()` ). If no second argument is provided the hook will run everytime the component renders, by giving it an empty array, we inform React to only render at the time of being mounted.

Now with our App component, we have a router, and within this router we have a route with a path of `/` that renders our home component, we want to add a couple of attributes to our `<Home />` component that will pass down as props to the implementation of the home component.

```
<Home isSearching={isSearching} postInfos={postInfos} />`
```

We have included the `Home` component implementation in the same file, so scroll down to the `const Home` component implementation and lets add the following lines in the return markup, right below the `<header>Home</header>` line.

```
{props.isSearching && <ProgressSpinner />}
<Posts postInfos={props.postInfos} />
```

This will provide a spinner while our data is loading and include a `<Posts />` component that knows how to render an array of `postInfos`. 

If you go back to the browser and refresh our app view, you should see the progress indicator and then a list of `postInfos`, you will notice there is no text, but we have the owner and timestamp showing. Next we will add the actual content of the posts.

🎉 Yay! We are making some great progress!

### Retrieving transaction data

To load the postInfo content we need to make a request for each postInfo to the Arweave gateway, using our arweave library `api.get` function. The `api.get` function performs an `HTTP GET` to the configured gateway in our `init` method.

Lets head back to `createPostInfos()` in the `src/lib/api.js` file and edit the last few lines of the function to return some content for our postInfo object.

```
    request: null,
	}
  if (postInfo.length < 1048) {
    postInfo.request = arweave.api.get(`/${node.id}`, { timeout: 10000 })
      .catch(() => { postInfo.error = 'timeout loading data' });
  } else {
    postInfo.error = 'data is too large.'
  }
}
```

We added a `request` property to our `postInfo` object with a promise that we can dynamically invoke as we render the `<Post />` component to lazily load all of the post content while rendering each postInfo.

Awesome, we have post content showing up!

### Binding transaction data

React's use of component architecture leads to a modular architecture that enables you to separate application logic from presentation side effects, this is a core strength of react. Our application includes a `<Posts />` component that gets reused in a number of pages/routes. Lets take a look at the `src/components/Posts.jsx` file and see how it works.

The first thing to note is that our `<Posts />` component just takes an array of the `postInfos` we have passed via `props` and we use the `map()` function to convert each `postInfo` into a `<PostItem />` component for react to render!

```
export const Posts = (props) => {
  return (
    <div>
      {props.postInfos.map(postInfo =>
        <PostItem key={postInfo.txid} postInfo={postInfo} />
      )}
    </div>
  )
};
```

When a component has a collection of child components, React prefers to have a key attribute to help keep the children sorted in a consistent order and optimize the re-rendering when components change to only render the actual child components that change. Using our `txid` in the `postInfo` object will be the perfect key for the react collection management.

### Optimizing view components

In the `<PostItem />` view component there is a lot of things going on.

```
const PostItem = (props) => {
  const [postMessage, setPostMessage] = React.useState('s'.repeat(Math.max(props.postInfo.length - 75, 0)));
  const [statusMessage, setStatusMessage] = React.useState("");
```

We have two React states, postMessage and statusMessage. Nothing unexpected there, but what's this weird initialization of postMessage to have a bunch of ‘s’ characters?

> The thing to note here is that the problematic two lines post now has two lines of text while loading. The repeated ssssss characters and the "loading…" status message. The additional line provided by the ssssss characters enables the post to have the same vertical extent before and after the message is loaded. This dramatically reduces the visual popping that occurs without the optimization.
> The cool thing about this optimization is that it was enabled by the fact that we know the number of characters in a post’s message data before we retrieve it from arweave! All thanks to the node.data.size we queried via GraphQL back in Querying from Javascript.

There is one more optimization we can do. What if we delayed the request so we would give the component a small amount of time to load the content before displaying the`postInfo`. In `src/App.js` we can modify the last line of the `getPostInfos()` to look use a `delayResults` function in our `src/lib/api.js` file.

```
return await delayResults(100, edges.map(edge => createPostInfo(edge.node)));
```

> NOTE: be sure to import delayResults from `./lib/api`

### Handling asynchronous state

The purpose of this `useEffect()` in the `<PostItem />` component is to await the transaction data request we initiated in `createPostInfo()` (in the [Retrieving transaction data](#retrieving-transaction-data) step). This is the densest logic we’ll cover in this guide, so we’ll take it step by step.

First off we have some local variables to track changes to the status and post messages that our `<PostItem /> `component renders.
```js
React.useEffect(() => {
  let newPostMessage = "";
  let newStatus = "";
```

Why not just use the `postMessage` and `statusMessage` variables we defined for our React state?

To answer that we have to take a step back and talk about some of the pitfalls of asynchronous network calls. This `useEffect()` executes when the `<PostItem />` component is loaded but the component may be unloaded at any moment if the user navigates to a different area of the UI and the component is removed from the view.

In this case of an unloaded component, if our `useEffect()` function tries to invoke `setPostMessage()` or `setStatusMessage()` to update the React state, it will result in a memory leak that React will complain bitterly about in the developer console.

So, we only want to update our React state if the `<PostItem />` component is still mounted and in use. We’ll see how to do that in a moment, but for now we’ll avoid updating the React state directly and track any changes to our posts status or message in local variables.

Next, we’ll want to do work only when the `item.message` property is undefined. This is true the first time `useEffect()` executes as the `<Post />` component is mounted.
```js
if (!props.item.message) {
 setStatusMessage("loading...");
 let isCancelled = false;
 
 const getMessage = async () => {
   const response = await props.item.request;
   if (!response) {
     newStatus = props.item.error;
   } else if (response.status && (response.status === 200 
     || response.status == 202)) {
     props.item.message = response.data;
     newStatus = "";
     newPostMessage = response.data;
   } else {
     newStatus = "missing data";
   }
 
   if (isCancelled)
     return;
   setStatusMessage(newStatus);
   setPostMessage(newPostMessage);
 }
 
 getMessage();
 return () => isCancelled = true;
}
```

The first thing we do is use the `setStatusMessage()` React state function to set a "loading…" status. Because this will happen the very first time the component is displayed (mounted) we don’t have to worry about setting React state on an unmounted component.

Next we need to expose a means for React to cancel our `useEffect()` call if the component is unmounted while `useEffect()` is in progress. To do that we set a control variable
```js
let isCancelled = false;
``` 

Next we declare an `async` `getMessage()` function. React’s `useEffect()` functions are not `async` themselves but declaring an inner `asyn`c function this way lets us write code that utilizes async calling semantics. This enables us to use `await` which improves readability by reducing the telescoping effect of using promise-style  `.then()`‘s repeatedly.

The first thing we do in `getMessage()` is to 
```js
const response = await props.postInfo.request`
```
This` props.item.request` may or may not have been completed before `useEffect()` is executed, but in either case we won’t move to the next line until we have a completed request.

When we created this item.request back in the [Retrieving transaction data](#retrieving-transaction-data) step, we also added a `.catch()` to handle any errors. If an error happened during the request, the value of response would end up being `undefined` and the error text would be stored in `item.error`.

So an error is the first thing we check for with `if (!response) {` and we store the error message in our local `newStatus` variable.

Next  is our valid case. We have a response and it has a status of 200 (the [HTTP Status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) for success) or in the case of a pending data a status of 202.

In this case we add a new property with  
```js
props.postInfo.message = response.data;
``` 
and we stuff the response data (post message) into it. If the `useEffect()` executes again and we already have the message we won’t have to do all this work again, Once we have the post message in hand, we no longer want to display the “loading…” status text in the `<PostItem /> `so we set our newStatus to an empty string.

We also update our `newPostMessage` local variable with the post message.
In the final else case, we set `newStatus = "missing data";` , in this case our request completed without error but the gateway returned something other than a 200 (success) status code. In almost all cases what is actually returned is a status code of 404 (the [HTTP Status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) for missing) meaning it couldn’t locate the data.

How can data be missing on Arweave? Isn’t data on arweave permanent?

Good question to ask, this situation can arise when someone posts a transaction but fails to upload the data (or the upload is interrupted). In this case the network may contain partial data or no data for a given transaction. Arweave supports re-uploading the data if an upload is interrupted and the nodes are incentivized to receive this data because it may be used when mining new nodes. A nice feature of arweave is you only pay for the first transaction, once the transaction is mined you are free to re-upload any missing data without any additional cost.

All right! We’re to the last bit.
```js
   if (isCancelled)
     return;
   setStatusMessage(newStatus);
   setPostMessage(newPostMessage);
```

First we check to see if our `useEffect()` has been canceled or not. If it has, we simply return making no React state changes and avoiding memory leaks. If not, we go ahead and push our local `newStatus` and `newPostMessage` variables into the react state to update the view.

But how do we know if we’ve been canceled or not? Who sets isCancelled to true?

Great question.

Other than calling our `getMessage()` function to manage the loading of the post message. The last thing `useEffect()` does is…
```js
return () => isCancelled = true;
```

By returning a function from `useEffect()` we are giving React a way to cancel our `useEffect()`. This simple return arrow function will set our `isCancelled` to `true` and make sure `getMessage()` never tries to update the React state of the component after it is unmounted.

## Posting Transactions

With Arweave, every write costs, but you only have to pay once. To allow our users to post transactions to the Arweave we need to get transactions signed by the users private key. But, we do not want to know what the private key is, we want the user to be able to keep that key private, this is where we need to communicate with a web3 wallet. In our case, we will be using the NEAR wallet to connect and use to sign our `postInfo` object to send to the bundlr network, a layer 2 technology that allows us to use different chain tokens to store data on Arweave.

### Connecting to a wallet

In order to allow NEAR Protocol users to add `posts` to the PublicSquare Arweave feed, we need a couple of libraries to install.

* near-api-js
* @bundlr-network/client

In the terminal window install these two modules

```
npm install near-api-js
npm install @bundlr-network/client
```

The `near-api-js` libraries contains the modules we need to use to work with the NEAR wallet, and the bundlr client is how we will bridge from the NEAR chain to the Arweave network. 

> You will need some NEAR tokens in your NEAR wallet in order to get this part working

There are specific steps we need to make to create a post:

1. Connect to the NEAR Wallet
2. Fund the bundlr account with enough yoctoNEAR to support the posting of the transaction
3. Post the transaction to the bundlr network, in which the bundlr network will deploy to Arweave

### Using NEAR API Helper library

In the `lib` folder there is a helper library we have created for the NEAR wallet, we will use this library to connect our dApp to the NEAR wallet.

``` js

import * as nearAPI from "near-api-js";
import { WalletConnection } from "near-api-js";

const { connect, keyStores } = nearAPI;

const NEAR_OPTS = {
  networkId: "mainnet",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.mainnet.near.org",
  walletUrl: "https://wallet.mainnet.near.org",
  helperUrl: "https://helper.mainnet.near.org",
};


export const getWallet = async () => {
  const near = await connect(NEAR_OPTS);
  return new WalletConnection(near, "bundlr");
}

export const isSignedIn = async () => {
  const wallet = await getWallet()
  return wallet.isSignedIn()
}

export const getAccountId = async () => {
  const wallet = await getWallet()
  return wallet.getAccountId()
}

export const signIn = async () => {
  const wallet = await getWallet()
  wallet.requestSignIn()
}

export const signOut = async () => {
  const wallet = await getWallet()
  wallet.signOut()
}
```

This library will give us some basic methods to call to check if the user is signed in, get the account id, sign in, and sign out. Let's open `WalletSelectButton.jsx` in our `src/components` folder to connect our near api to our React app. 

The first thing we want to do is import the api methods

```
import { isSignedIn, signIn, getAccountId } from '../lib/near'
```

Next lets create a constanct to represent `NEAR`

```
const NEAR = "near";
```

In the `WalletButton` button component, we need to add a NEAR case to the switch statement.

```
	case NEAR:
      return (<div className="walletButton altFill">
        <img src="near_icon_wht.svg" alt="wallet icon" />
        <p>{props.walletAddress}</p>
      </div>)
```

At the top of the `WalletSelectButton` component after the `useState` lines of code, let's add a useEffect hook, this hook will run when the component is mounted to the app. The purpose of this hook is to check if the user has signed in with the NEAR Wallet. Since the wallet connection process, redirects the user to wallet.near.org, then once connected redirects the user back to our app. We need to initialize the WalletConnection and verify the user is signed in to their NEAR wallet.

> NOTE: 

```
useEffect(() => {
    const loadWallet = async () => {
      if (await isSignedIn()) {
        setAddressText(await getAccountId())
        setActiveWallet(NEAR)
				props.onWalletConnect()
      }
    }
    loadWallet()
  }, [])
```

In the `WalletModal` component, we need to add the NEAR sign in case to the switch statement.

```
      case NEAR:
        await signIn()
        break;

```

### Creating a new post

Now that we have connected our wallet, we are ready to create a new Post. Our app provides a React component to get us started. Open up `src/App.js` and locate the Home component. Right below the line `<header>Home</header>`, add the following component declaration.

```
<NewPost />
```

You editor should automatically add...

```
import { NewPost } from './components/NewPost';
```

You should now see a place in your app to start posting, but we have not added the logic so it won't do much.

We need to activate the component by letting it know that the wallet is connected. Lets modify the `<Home>` component rendering to add an attribute for `isWalletConnected` and set it to the `isWalletConnected` state.

``` js
<Home
		isWalletConnected={isWalletConnected}
		isSearching={isSearching}
		postInfos={postInfos}
	/>
```
	
Then in the `Home` component method, we need to add an attribute to the `<NewPost>` component.
	
``` js
	<NewPost isLoggedIn={props.isWalletConnected} />
```
	
Now when you reload the app and connect your wallet, you should be able to start typing a post, and see the `Post` button light up.

Open `src/components/NewPost.jsx` in your editor. 
	
First off, let’s go over the react state variables the `<NewPost /> `component is using.

```js
const [postValue, setPostValue] = React.useState("");
const [isPosting, setIsPosting] = React.useState(false);
```

You can dig into the implementation if you’re inclined, but all you really need to know is that 
* The text the user types into the textarea is stored in `postValue`
* We can set a flag, `isPosting`, to enable or disable input on the interactive elements.. Disabling input on post provides visual feedback to the user that the post has been submitted. It also prevents them from hitting the “Post” button multiple times, potentially posting duplicate posts unintentionally.

### Submitting a Transaction to Arweave

At long last, we have been building up to this moment, the time to submit some data using a NEAR Wallet to Arweave, we will be using the bundlr client to perform this function. It will happen in a few steps:

* Fund the bundler account using NEAR to pay for the transaction
* Create the transaction
* Sign the transaction
* Upload the transaction

Let's create a library file to help us with the Bundlr Module, create a new file in `src/lib` called `bundlr.js` 

```
import { WebBundlr } from "@bundlr-network/client/build/web";
import { getWallet } from './near'
```

Import `WebBundlr` and `getWallet` in to our `bundlr.js` module.

Next, add a `getBundlr` function to use in all of our export functions, this function will get the wallet and init a bundlr object to use to fund, create, sign and post the transaction.

```
const getBundlr = async () => {
  const wallet = await getWallet()
  const bundlr = new WebBundlr(
    "https://node1.bundlr.network",
    "near",
    wallet
  );
  await bundlr.ready();
  return bundlr
}
```

Next we will create a `createTx` function, this function takes two arguments:

* text: which is a string representing the data to submit
* tags: an array of `{name, value}` objects that will be the meta data on the transaction that we can use in GraphQL to query for.

```
export const createTx = async (text, tags) => {
  const bundlr = await getBundlr()
  return await bundlr.createTransaction(text, { tags })
}
```

Fund the bundlr account, in order to post transactions on to Arweave using different tokens that AR, you need to fund your bundlr account with enough of the NEAR Token to pay for the upload. This function will take a size add 10% and calculate a price, to cover the amount NEAR required to upload the transaction. 

> NOTE: We added a delay in the funding process to give some time for the network to resolve the balance.

```
export const fundBundlr = async (size) => {
  const bundlr = await getBundlr()
  // calculate amount based on size * 10%
  const total = Math.round(Number(size) * 1.10)

  const amount = (await bundlr.getPrice(total)).toString()
  await bundlr.fund(amount);
  await delay(1000) // wait for funding to occur
  // check balance
  const balance = (await bundlr.getLoadedBalance()).toString();
  if (Number(balance) >= Number(amount)) {
    return true
  }
  return false
}
```

This is the delay function we use to pause the funding process waiting for the balance to clear.

```
function delay(t) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, t);
  });
}
```

Now that we have our bundlr support module, we are ready to create a new `Post`, in the `src/components/NewPost.jsx` component, lets modify the `onPostButtonClicked` function to include the following:

```
async function onPostButtonClicked() {
    setIsPosting(true)

    const funded = await fundBundlr(postValue.length)
    if (funded) {
      const tx = await createTx(postValue, [
        { name: 'App-Name', value: 'PublicSquare' },
        { name: 'Content-Type', value: 'text/plain' },
        { name: 'Version', value: '1.0.1' },
        { name: 'Type', value: 'post' },
        { name: 'Wallet', value: 'NEAR' }
      ])
      try {
        await tx.sign()
        await tx.upload()
				setPostValue("");
				//setTopicValue("");
				if (props.onPostMessage) {
				  props.onPostMessage(tx.id)
				}
      } catch (err) {
        console.log(err)
      }
    } else {
      alert('Could not fund bundlr!')
    }
    setIsPosting(false)
  }
```

In this function, we toggle the IsPosting flag to true, then we fund the transaction by calling the `fundBundlr` function passing the length of the message, then we create a Transaction adding our data and tags. Now that we have a transaction, we sign and upload the transaction, finally notifying any parent that we successfully uploaded our `Post`.

🎉🎉 Congrats you are now deploying your `Posts` on to the PublicSquare of Arweave!

## Polishing and Deploying to the Permaweb

Now that we have the core functionality working for our application, lets spend some time to polish up our application and deploy the app to the Permaweb.




