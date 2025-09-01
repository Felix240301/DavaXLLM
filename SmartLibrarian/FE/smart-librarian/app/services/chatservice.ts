const baseUrl = "http://127.0.0.1:8000";

export async function getChatResponse(text: string):Promise<string> { 
    const response = await fetch(`${baseUrl}/ask_smart_librarian`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    });
    const data = await response.json();
    console.log("Response from server:", data);
    return data.response;
}