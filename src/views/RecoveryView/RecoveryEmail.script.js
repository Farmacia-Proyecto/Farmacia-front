export default {
    name: "LoginPage",
    data() {
      return {
        email: "",
        password: "",
        error: false,
      };
    },
    methods: {
      login() {
        console.log(this.email);  
      },
    },
  };