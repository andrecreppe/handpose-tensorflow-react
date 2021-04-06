import React, { useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';
import * as fp from 'fingerpose';
import { drawHand } from './utilities';

import victory from './images/victory.png'
import thumbs from './images/thumbs.png'
import './App.css';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [emoji, setEmoji] = useState(null);
  const images = {
    thumbs_up: thumbs,
    victory: victory
  };

  const runHandpose = async () => {
    const net = await handpose.load();
    // console.log('Handpose model loaded');

    // Loop and detect hands
    const timer = 100; // ms
    setInterval(() => {
      detect(net);
    }, timer);
  }

  const detect = async (net) => {
    // Check data is available
    if(
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      
      // Set video and canvas dimensions
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Handpose detection
      const hand = await net.estimateHands(video);
      // console.log(hand);

      // Gesture detection
      if(hand.length > 0) {
        // Gestures to be detected
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture
        ]);

        const minConfidence = 8;
        const gesture = await GE.estimate(hand[0].landmarks, minConfidence);
        // console.log(gesture);

        if(gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map((pred) => {
            return pred.confidence;
          });

          const maxConf = confidence.indexOf(
            Math.max.apply(null, confidence)
          );

          setEmoji(gesture.gestures[maxConf].name);
          console.log(images[emoji]);
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext('2d');
      drawHand(hand, ctx);
    }
  }

  runHandpose();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam 
          ref={webcamRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 9,
            width: 640,
            height: 480
          }} 
        />

        <canvas 
          ref={canvasRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 9,
            width: 640,
            height: 480
          }} 
        />

        { emoji !== null ? 
          <img 
            src={images[emoji]} 
            style={{
              position: 'absolute',
              marginLeft: 'auto',
              marginRight: 'auto',
              left: 400,
              bottom: 500,
              zIndex: 10,
              right: 0,
              textAlign: 'center',
              height: 100
            }} 
          /> : '' }
      </header>
    </div>
  );
}

export default App;
