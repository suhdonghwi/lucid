import { CodeWindow } from "@/components/CodeWindow";
import { CallGraph } from "@/CallGraph";
import * as cls from "./index.css";

type CodeSpaceProps = {
  mainCode: string;
  onMainCodeChange: (mainCode: string) => void;

  callGraph: CallGraph;
};

export function CodeSpace({
  mainCode,
  onMainCodeChange,
  callGraph,
}: CodeSpaceProps) {
  return (
    <div className={cls.rootContainer}>
      <div className={cls.windowsContainer}>
        {callGraph.nodes.map((callNode, index) => {
          const latestRange = callNode.top();
          return (
            <CodeWindow
              key={index}
              code={mainCode}
              onCodeChange={index === 0 ? onMainCodeChange : undefined}
              posRange={callNode.event?.posRange}
              mode={
                latestRange === undefined
                  ? { type: "normal" }
                  : { type: "eval", range: latestRange }
              }
            />
          );
        })}
      </div>
    </div>
  );
}
