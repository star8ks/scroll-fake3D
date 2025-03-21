"use client";

import React from "react";
import ScrollSequence from "../components/ScrollSequence";
import EnhancedFake3D from "../components/EnhancedFake3D";
import styles from "./page.module.css";
import { Element } from "react-scroll";

const appleSequenceImages = Array.from(
  { length: 33 },
  (_, i) => `${i.toString().padStart(4, "0")}.webp`
);
// const appleSequenceImages = ['Borges.jpg'];

const HomePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <section
        className={`${styles.scrollSequenceContainer} ${styles.appleContainer}`}
      >
        <ScrollSequence
          images={appleSequenceImages}
          imagesRoot="/images/rose/"
          imagesDepthRoot="/images/rose-depth/"
          playbackSpeed={10}
        />
        <div className={styles.fake3dWrapper}>
          {/* <EnhancedFake3D
          imageUrl="/images/borges/Borges@2x.png"
          depthUrl="/images/borges/Borges@2x_depth_apple.png"
          useGyroscope
          horizontalThreshold={150.0}
          verticalThreshold={150.0}
          verticalFix={-0.8}
        /> */}
        </div>
        <div className={styles.scrollSequenceContent}>
          <Element name="scrollSequence" className={styles.speak}></Element>
          <Element name="textAnimation" className={styles.speak}></Element>
        </div>
      </section>

      <section className={styles.additionalSection}>
        <Element name="finalThoughts" className={styles.speak}></Element>
      </section>
    </div>
  );
};

export default HomePage;
