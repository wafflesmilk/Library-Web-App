const Login = {
    template:`
    <v-card class=" ma-6 bg-light-blue-lighten-3"  elevation="4">
        <v-card-title class="text-center">Login</v-card-title>
        <v-container class="bg-white" fluid>
            <v-form fast-fail>
                <v-text-field class="my-1" 
                v-model="username" 
                label="Username" 
                :rules="requiredRule">
                </v-text-field>

                <v-text-field class="my-1" 
                v-model="password" 
                label="Password" 
                :rules="[...requiredRule]"
                :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append-inner="show = !show"
                >
                </v-text-field>
                <div class="d-flex justify-center mt-4">
                <v-btn elevation="4" @click="login">Submit</v-btn>
                </div>
            </v-form>
            <v-alert v-if="msg == 'success'" type="success" title="Success" text="Successfully logged in." class="ma-2" :height="60"></v-alert>
            <v-alert v-else-if="msg && msg != 'success'" type="error" title="Error"class="ma-2" :height="60">{{msg}}</v-alert>
            </v-container>

    </v-card>
    `,
    data:()=>({
        show:false,
        msg:'',
        username:'',
        password:'',
        requiredRule:[
            v => {
                if(v) return true
                return "This field is required."
            }
        ]
    }),

    methods:{
        login(){
            var self = this; 
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password 
                })
            };
           
            fetch("resources/api_login.php/", requestOptions)

            .then( response =>{
                return response.json( ); //convert response to json
            })

            .then( data =>{ 
                if (data == null) {// didn't find this username password pair
                    self.msg="Incorrect username or password.";
                    this.password = ""; //reset password field 
                }
                else{
                    self.msg = 'success';
                    this.$emit("isAuthenticated", true);
                    this.$emit("username", this.username);
                    setTimeout(() => { //shows the success alert before redirecting user to home page 
                        this.$emit("isAuthenticated", true);
                        this.$emit("username", self.username);
                        this.$router.replace({name: "home", params: { username: self.username }});
                    }, 2000); // 2 seconds delay
                }
            })
            
            .catch(error => {
                self.msg = "Error: "+ error;
            });    
        }
    }
}