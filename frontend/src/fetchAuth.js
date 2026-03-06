import { getToken, logout } from "./auth";
import { API_URL } from "./config";

export async function fetchAuth(url, options = {}) {

  const token = getToken();

  const res = await fetch(`${API_URL}${url}`,{
    ...options,
    headers:{
      "Content-Type":"application/json",
      Authorization:`Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if(res.status === 401){
    logout();
    window.location.reload();
    return;
  }

  return res.json();
}