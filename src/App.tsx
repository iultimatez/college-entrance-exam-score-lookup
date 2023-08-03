import React, { useState, useEffect } from "react";
import "./App.css";
import { dataObj } from "./data";

interface RowProcessed {
  no: number;
  subjects: string;
  score_interval: string;
  count: number;
  percentage: number;
  accu_count_desc: number;
  accu_percentage_desc: number;
  accu_count_asc: number;
  accu_percentage_asc: number;
}

function App() {
  const subjectMap: { [subject: string]: RowProcessed[] } = JSON.parse(dataObj);
  const scoreObj: { [subject: string]: number } = {
    國文: 0,
    英文: 0,
    數甲: 0,
    數學A: 0,
    數學B: 0,
    自然: 0,
    生物: 0,
    化學: 0,
    物理: 0,
    社會: 0,
    地理: 0,
    歷史: 0,
    公民與社會: 0,
    體育: 0,
    "美術(不含美術成績)": 0,
    "音樂(不含音樂成績)": 0,
  };
  const parseScore = (scoreString: string): number => {
    const parsed = parseInt(scoreString, 10);
    if (!parsed) {
      return 0;
    }
    if (parsed > 60) {
      return 0;
    }
    return parsed;
  };
  const [scoreMap, setScoreMap] = useState(() => {
    const saved = localStorage.getItem("scores");
    const defaultMap = new Map(Object.entries(scoreObj));
    if (!!saved) {
      const initialValue = JSON.parse(saved);
      if (!!initialValue) {
        Object.keys(scoreObj).forEach((s) => {
          if (s in initialValue) {
            defaultMap.set(s, parseScore(initialValue[s]));
          }
        });
      }
    }
    return defaultMap;
  });
  const selectionObj: { [subject: string]: boolean } = {
    國文: false,
    英文: false,
    數甲: false,
    數學A: false,
    數學B: false,
    自然: false,
    生物: false,
    化學: false,
    物理: false,
    社會: false,
    地理: false,
    歷史: false,
    公民與社會: false,
    體育: false,
    "美術(不含美術成績)": false,
    "音樂(不含音樂成績)": false,
  };
  const [selectionMap, setSelectionMap] = useState(
    new Map(Object.entries(selectionObj))
  );
  const [validInput, setValidInput] = useState(false);
  const subjects = [
    "國文",
    "英文",
    "數甲",
    "數學A",
    "數學B",
    "自然",
    "生物",
    "化學",
    "物理",
    "社會",
    "地理",
    "歷史",
    "公民與社會",
    "體育",
    "美術(不含美術成績)",
    "音樂(不含音樂成績)",
  ];
  const [countInterval, setCountInterval] = useState("");
  const [percentageInterval, setPercentageInterval] = useState("");
  const [score, setScore] = useState(0);
  const [combination, setCombiation] = useState("");
  const [tableIndex, setTableIndex] = useState(0);
  useEffect(() => {
    let totalScore = 0;
    const selectedSubjects: string[] = [];
    selectionMap.forEach((selection, subject) => {
      if (selection) {
        totalScore += scoreMap.get(subject) || 0;
        selectedSubjects.push(subject);
      }
    });
    const lookUpKey = selectedSubjects.sort().join("-");
    const scoreMapObj: { [subject: string]: number } = {};
    scoreMap.forEach((sc, sub) => {
      scoreMapObj[sub] = sc;
    });
    // console.log(scoreMapObj);
    // console.log();
    localStorage.setItem("scores", JSON.stringify(scoreMapObj));
    // console.log(lookUpKey);
    const scoreList = subjectMap[lookUpKey];
    if (!scoreList) {
      setValidInput(false);
      return;
    }
    // console.log(scoreList.length);
    const maxScore = scoreList.length;
    if (totalScore > maxScore || totalScore < 0) {
      // console.log("ERROR");
      setValidInput(false);
      return;
    }
    // console.log(maxScore);
    const currentInterval =
      totalScore < 1 ? scoreList[totalScore] : scoreList[totalScore - 1];
    const prevInterval =
      totalScore >= maxScore
        ? scoreList[totalScore - 1]
        : scoreList[totalScore];
    // console.log(`Score: ${totalScore}`);
    // console.log(
    //   `名次區間: ${prevInterval.accu_count_desc} - ${currentInterval.accu_count_desc}`
    // );
    // console.log(
    //   `百分比區間: ${prevInterval.accu_percentage_desc} - ${currentInterval.accu_percentage_desc}`
    // );
    // console.log(prevInterval);
    // console.log(currentInterval);
    setCountInterval(
      `${prevInterval.accu_count_desc} - ${currentInterval.accu_count_desc}`
    );
    setPercentageInterval(
      `${prevInterval.accu_percentage_desc}% - ${currentInterval.accu_percentage_desc}%`
    );
    setValidInput(true);
    setScore(totalScore);
    setCombiation(lookUpKey);
    setTableIndex(totalScore === 0 ? maxScore - 1 : maxScore - totalScore);
  }, [selectionMap, scoreMap, subjectMap]);
  return (
    <div className="App">
      <p></p>
      <h1>分科測驗落點查詢(112學年度)</h1>
      <div className="container-sm text-center">
        {validInput ? (
          <div className="row">
            <h3>總分: {score}</h3>
            <h3>名次區間: {countInterval}</h3>
            <h3>百分比區間: {percentageInterval}</h3>
          </div>
        ) : (
          <div className="row">
            <h3>請輸入成績並勾選科目，如果有對應的組合，結果將會自動出現</h3>
          </div>
        )}
        <div className="inputs">
          {subjects.map((subject) => {
            return (
              <div className="individual-input" key={`${subject}-row`}>
                <div className="input-group mb-3">
                  <div className="input-group-text">
                    <input
                      className="form-check-input mt-0"
                      type="checkbox"
                      checked={!!selectionMap.get(subject)}
                      onChange={(e) => {
                        setSelectionMap(
                          new Map(
                            selectionMap.set(
                              subject,
                              !selectionMap.get(subject)
                            )
                          )
                        );
                      }}
                    />
                  </div>
                  <span className="input-group-text">{subject}</span>
                  <input
                    type="text"
                    className="form-control"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={scoreMap.get(subject)}
                    onChange={(event) => {
                      setScoreMap(
                        new Map(
                          scoreMap.set(subject, parseScore(event.target.value))
                        )
                      );
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {validInput && (
          <div className="row">
            <h3>完整列表</h3>
            <p>
              組別：{subjectMap[combination][0].no} 科目名稱：
              {subjectMap[combination][0].subjects}
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">分數區間</th>
                  <th scope="col">人數</th>
                  <th scope="col">百分比</th>
                  <th scope="col">人數(從高分到低分累計)</th>
                  <th scope="col">百分比(從高分到低分累計)</th>
                  <th scope="col">人數(從低分到高分累計)</th>
                  <th scope="col">百分比(從低分到高分累計)</th>
                </tr>
              </thead>
              <tbody>
                {[...subjectMap[combination]]
                  .reverse()
                  .map((subject, index) => {
                    const isThis = index === tableIndex;
                    const rowClassName = isThis ? "table-warning" : undefined;
                    return (
                      <tr
                        className={rowClassName}
                        key={`${subject}-list-row-${index}`}
                      >
                        <td>{subject.score_interval}</td>
                        <td>{subject.count}</td>
                        <td>{subject.percentage}</td>
                        <td>{subject.accu_count_desc}</td>
                        <td>{subject.accu_percentage_desc}</td>
                        <td>{subject.accu_count_asc}</td>
                        <td>{subject.accu_percentage_asc}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      資料來源：
      <a
        className="App-link"
        href="https://www.uac.edu.tw/"
        target="_blank"
        rel="noopener noreferrer"
      >
        大學考試入學分發委員會
      </a>
    </div>
  );
}

export default App;
