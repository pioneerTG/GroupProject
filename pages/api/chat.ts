import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

export default async function chat(req: NextApiRequest, res: NextApiResponse) {
  const {flag} = req.body.prompt;
  if (!flag) {
    // 식단 추천
    console.log("식단 추천 chat.gpt")
    try {
      const { gender, age, height, weight, allergy, disease, dateString } = req.body.prompt; // 구조분해 할당, chatgpt/index.js에서 보내온 prompt변수 구조분해할당 받음
      // const age = req.body.prompt.res
      const config = new Configuration({
        apiKey: process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY,
      });
      const openai = new OpenAIApi(config);
      // if (buttonInput === "button1") {
      let promptText = `나이 ${age}살, 키 ${height}cm, 몸무게 ${weight}kg인 ${gender}에게 알맞은 식단을 구성해주세요.`;
      if (allergy !== "정보 없음") {
        promptText += ` ${allergy}이(가) 없는 음식으로만 구성해주세요.`;
      }
      if (disease !== "정보 없음") {
        promptText += ` ${disease}환자가 피해야 할 음식은 제외해주세요.`; // 먹지 못하는 -> 피해야 할
      }
      promptText += ` 대답은'년 월 일 (요일)
      점심: 밥(200kcal, 1g 지방, 4g 단백질, 40g 탄수화물) + 닭가슴살 볶음(200kcal, 8g 지방, 16g 단백질, 4g 탄수화물)'와 같이 ${dateString}을 기준으로 7일치 식단을 구성해주세요.`
      const response = await openai.createCompletion({
        // response 변수에 객체값 담김
        model: "text-davinci-003", // 사용할 GPT 모델
        prompt: promptText, // GPT 모델에 입력할 텍스트
        temperature: 0.2, // 다음에 생성될 단어를 무작위로 선택하는 정도. 0이면 항상 같은 단어, 값이 높으면 더 많은 무작위성 (0~2, 기본값 1)
        // 0.8과 같은 높은 값은 출력을 더 무작위로 만들고 0.2와 같은 낮은 값은 더 집중적이고 결정적으로 만듬
        max_tokens: 3999, // 생성할 최대 단어 수
        top_p: 0.2, // 다음에 선택될 단어의 확률 분포에서 상위 p%만 고려. 이 값이 1이면 모든 가능한 후보가 고려, 값이 작을수록 더 많은 무작위성
        // 생략시 frequency_penalty의 기본값은 0, presence_penalty의 기본값은 0.6
        frequency_penalty: 0.2, // 모델이 이전 대화에서 많이 사용된 단어를 덜 사용하도록 유도하는 속성. 이 값을 높일수록 이전 대화에서 자주 사용된 단어가 모델 출력에서 더욱 적게 나타남.
        presence_penalty: 0.4, // 모델이 이전 대화에서 나타나지 않았던 단어를 더 자주 사용하도록 유도하는 속성. 이 값을 높일수록 이전 대화에서 나타나지 않은 단어가 모델 출력에서 더욱 자주 나타남.
      });
      res.status(200).json({ response: response.data.choices[0] }); // HTTP 응답 상태 코드 반환(상태코드와 함께 전송), 200은 ok를 나타냄.
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  } else if (flag) {
    // 운동 추천
    const {buttonType} = req.body.prompt;
    console.log('버튼타입:',buttonType)
    if(!buttonType){ // 운동 추천
      console.log("운동 추천 chat.gpt")
      try {
        const { gender, age, height, weight, goalWeight, training, dateString } = req.body.prompt;
        const config = new Configuration({
          apiKey: process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY,
        });
        const openai = new OpenAIApi(config);
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: "나이 "+age+"살, 키 "+height+"cm, 몸무게 "+weight+"kg, 목표 몸무게 "+goalWeight+"kg인 "+gender+"에게 "+training+" 중에서 적합한 운동을 골라서, "+dateString+"을 시작으로 7일치 스케줄을 만들어주세요. 대답은 년 월 일(요일) : 추천 운동들(횟수, 셋트가 있다면 셋트 수 없다면 안 나타내도 됨) 형태로 해주세요.",
          temperature: 0.2,
          max_tokens: 2048,
          top_p: 0.2,
        });
        res.status(200).json({ response: response.data.choices[0] }); // HTTP 응답 상태 코드 반환(상태코드와 함께 전송), 200은 ok를 나타냄.
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      }
    }else if(buttonType){ // 추천된 운동을 계획에 반영.
      console.log("계획 반영 chat.gpt")
      try {
        const { data } = req.body;
        // console.log(data); data오는거 확인
        const config = new Configuration({
          apiKey: process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY,
        });
        const openai = new OpenAIApi(config);
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: data+"이 문장에서 운동스케줄을 MySQL에 입력하려 합니다. Json형태로 가공해주세요. 키값은 날짜(createAt), 운동명(type), 횟수(count)로 나뉘게 해주세요. 셋트수가 1이상이면 횟수(count)에 곱해주세요. 날짜는 date형식으로 저장되도록 요일은 빼주세요.",
          temperature: 0.2,
          max_tokens: 2048,
          top_p: 0.2,
        });
        res.status(200).json({ response: response.data.choices[0] }); // HTTP 응답 상태 코드 반환(상태코드와 함께 전송), 200은 ok를 나타냄.
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      }      
    }
  }
}
