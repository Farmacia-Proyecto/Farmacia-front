import axios from "axios";

export default {
  async login(userName, password) {
    const response = await axios.post(
      "http://192.168.20.77:3000/api/login",
      { userName, password },
      { withCredentials: true }
    ).then(res=> res.data);
    const token = response.token;
    return token;
  }
};
