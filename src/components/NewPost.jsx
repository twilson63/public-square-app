import React from 'react'
import TextareaAutosize from 'react-textarea-autosize';
import { arweave, getTopicString } from '../lib/api';
import { createTx, fundBundlr } from '../lib/bundlr'

export const NewPost = (props) => {
  const [postValue, setPostValue] = React.useState("");
  const [isPosting, setIsPosting] = React.useState(false);

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

  let isDisabled = postValue === "";

  if (props.isLoggedIn) {
    if (isPosting) {
      return (
        <div className="newPost">
          <div className="newPostScrim" />
          <TextareaAutosize
            value={postValue}
            readOnly={true}
          />
          <div className="newPost-postRow">
            {/* <div className="topic">
              # 
              <input
                type="text" 
                placeholder="topic"
                className="topicInput"
                value={topicValue}
                disabled={true}
              />
            </div> */}
            <div >
              <button
                className="submitButton"
                disabled={true}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="newPost">
          <TextareaAutosize
            value={postValue}
            onChange={e => setPostValue(e.target.value)}
            rows="1"
            placeholder="What do you have to say?"
          />
          <div className="newPost-postRow">
            {/* <div className="topic"
              style={{color: topicValue  && "rgb( 80, 162, 255)" }}
            >
              # 
              <input
                type="text" 
                placeholder="topic"
                className="topicInput"
                value={topicValue}
                onChange={e => onTopicChanged(e)}
              />
            </div> */}
            <div >
              <button
                className="submitButton"
                disabled={isDisabled}
                onClick={onPostButtonClicked}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )
    }
  } else {
    return (<div className="darkRow">Connect your wallet to start posting...</div>)
  }
};
