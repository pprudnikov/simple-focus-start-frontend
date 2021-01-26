import React, { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";
import Peer from "simple-peer";
import './video-chat-page.scss';
import { useAuth } from "../../contexts/AuthContext";
import { useHistory, useLocation, Prompt } from "react-router-dom";
import { useVideo } from "../../contexts/VideoContext";

const VideoChatPage = () => {
  // ref
  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();
  // state
  // other
  const history = useHistory();
  const {
    // state
    receivingCall,
    callAccepted,
    stream,
    caller,
    // actions
    stopCurrentUserVideo,
    stopCall,
    startVideo,
    callPeer,
    acceptCall
  } = useVideo();
  const { currentUser, allUsers } = useAuth();

  let UserVideo;
  if (stream) {
    UserVideo = (
      <video playsInline muted ref={userVideo} autoPlay/>
    );
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = (
      <video playsInline ref={partnerVideo} autoPlay/>
    );
  }

  let IncomingCall;
  if (receivingCall && !callAccepted) {
    IncomingCall = (
      <div>
        <h1>{caller} is calling you</h1>
        <button onClick={() => {
          acceptCall(socket, partnerVideo)
        }}>
          Accept
        </button>
      </div>
    )
  }

  useEffect(() => {
    return () => {
      console.log('video unmount')
    }
  }, []);

  useEffect(() => {
    startVideo(socket, userVideo);
  }, [ currentUser ]);

  return (
    <div className={'videochat-wrapper container'}>
      <div className={'videochat'}>
        <Prompt
          when={!!stream}
          message={(() => {
            if (!!stream) {
              stopCall(userVideo.current, partnerVideo.current);
            }
            return true;
          })}
        />
        <div>
          {UserVideo}
          {PartnerVideo}
        </div>
        <div>
          {allUsers.map(user => {
            if (user.id === currentUser.id) {
              return null;
            }
            return (
              <button
                key={user.id}
                onClick={() => callPeer(user.id, socket, partnerVideo)}>
                Call {user.id} {user.name}
              </button>
            );
          })}
          <button onClick={() => {
            stopCurrentUserVideo(userVideo.current);
          }}>
            stop video
          </button>
          <button onClick={() => {
            startVideo(socket, userVideo)
          }}>
            start video
          </button>
          <button onClick={() => {
            stopCall(userVideo.current, partnerVideo.current);
          }}>
            stop call
          </button>
        </div>
        <div>
          {IncomingCall}
        </div>
      </div>
    </div>
  );
}

export default VideoChatPage;
