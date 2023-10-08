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
        {callGraph.map((callNode, index) => {
          const latestEvalEvent = callNode.evalStack.at(-1);

          return (
            <CodeWindow
              key={index}
              code={mainCode}
              onCodeChange={index === 0 ? onMainCodeChange : undefined}
              posRange={callNode.frameEvent?.posRange}
              mode={
                latestEvalEvent === undefined
                  ? { type: "normal" }
                  : { type: "eval", range: latestEvalEvent.posRange }
              }
            />
          );
        })}
      </div>
    </div>
  );
}
