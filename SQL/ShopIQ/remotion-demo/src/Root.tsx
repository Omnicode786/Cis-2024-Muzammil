import { AbsoluteFill, Composition, Sequence } from "remotion";
import { VIDEO, sceneDuration, sceneStarts } from "./config/videoConfig";
import { IntroScene } from "./scenes/IntroScene";
import { ProductContextScene } from "./scenes/ProductContextScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { ProductRevealScene } from "./scenes/ProductRevealScene";
import { FeatureWalkthroughPartOneScene } from "./scenes/FeatureWalkthroughPartOneScene";
import { FeatureWalkthroughPartTwoScene } from "./scenes/FeatureWalkthroughPartTwoScene";
import { WorkflowScene } from "./scenes/WorkflowScene";
import { TrustPolishScene } from "./scenes/TrustPolishScene";
import { FinalScene } from "./scenes/FinalScene";

function SaaSDemo() {
  return (
    <AbsoluteFill style={{ backgroundColor: "#05060a" }}>
      <Sequence from={sceneStarts.intro} durationInFrames={sceneDuration("intro")}>
        <IntroScene duration={sceneDuration("intro")} />
      </Sequence>
      <Sequence from={sceneStarts.context} durationInFrames={sceneDuration("context")}>
        <ProductContextScene duration={sceneDuration("context")} />
      </Sequence>
      <Sequence from={sceneStarts.problem} durationInFrames={sceneDuration("problem")}>
        <ProblemScene duration={sceneDuration("problem")} />
      </Sequence>
      <Sequence from={sceneStarts.reveal} durationInFrames={sceneDuration("reveal")}>
        <ProductRevealScene duration={sceneDuration("reveal")} />
      </Sequence>
      <Sequence from={sceneStarts.featuresOne} durationInFrames={sceneDuration("featuresOne")}>
        <FeatureWalkthroughPartOneScene duration={sceneDuration("featuresOne")} />
      </Sequence>
      <Sequence from={sceneStarts.featuresTwo} durationInFrames={sceneDuration("featuresTwo")}>
        <FeatureWalkthroughPartTwoScene duration={sceneDuration("featuresTwo")} />
      </Sequence>
      <Sequence from={sceneStarts.workflow} durationInFrames={sceneDuration("workflow")}>
        <WorkflowScene duration={sceneDuration("workflow")} />
      </Sequence>
      <Sequence from={sceneStarts.trust} durationInFrames={sceneDuration("trust")}>
        <TrustPolishScene duration={sceneDuration("trust")} />
      </Sequence>
      <Sequence from={sceneStarts.final} durationInFrames={sceneDuration("final")}>
        <FinalScene />
      </Sequence>
    </AbsoluteFill>
  );
}

export function Root() {
  return (
    <Composition
      id={VIDEO.compositionId}
      component={SaaSDemo}
      durationInFrames={VIDEO.durationSeconds * VIDEO.fps}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
}

