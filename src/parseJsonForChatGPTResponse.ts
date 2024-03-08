import jsonic from "jsonic";

export function parseJsonForChatGPTResponse(response: string) {
  let jsonData: any = null;

  const responseString = response
    .replace(/```json/g, "")
    .replace(/```/g, "");

  try {
    jsonData = jsonic(responseString);
  } catch (e) {
    try {
      jsonData = JSON.parse(responseString);
    } catch (e) {
      console.error(e);
    }
  }
  return jsonData;
}
