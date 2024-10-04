const Read = {
    data(){
        return{
            myBooks : [],
            perPage : 18,
            currentPage :  1
        }
    },

    methods:{
        getBooks() {
            const username = this.$route.params.username;
            fetch(`resources/apis.php/user_books/username/${username}`)
            .then(response => response.json())
            .then(data => {
                const Books = (data.filter(item => item.type == 'read'));
                this.getBookDetails(Books);
            })
            .catch(error => {
                alert('Failed to retrieve books. ' + error);
            });
        },
        getBookDetails(books) {
            books.forEach(book => {
                fetch(`resources/apis.php/books/bookID/${book.bookID}`)
                .then(response => response.json())
                .then(bookDetails => {
                    book = bookDetails;
                    this.myBooks.push(book[0]);
                })
                .catch(error => {
                    alert('Failed to retrieve book details: ' + error);
                });
            });
        }
    },

    computed:{
        //pagination
        getItems() {
            let start = (this.currentPage - 1) * this.perPage;
            let end = start + this.perPage;
            return this.myBooks.slice(start, end);
        },
        getPageCount() {
        return Math.ceil(this.myBooks.length / this.perPage);
        }
    },
    
    template:`
   <v-container fluid class="read">
   <div v-if="myBooks.length == 0">
        <p class=" font-italic text-center text-body d-flex flex-column justify-center">No books here at the moment! Head to the home page to add books.</p>
   </div>
    <v-row v-else class="justify-start align-center">
        <v-col v-for="item in getItems" :key="item" lg="2" md="3" sm="4" class="my-lg-3">
        <v-card 
            hover 
            :width="150" 
            :height="280" 
            :rounded="0"
            >
            <v-img 
            :src="'https://covers.openlibrary.org/b/id/' + item.img + '-L.jpg'" 
            cover 
            :width="150" 
            :height="220"
            >
            </v-img>

            <v-card-text class="text-wrap text-center text-subtitle-2 text-truncate black mx-1 mt-1 pa-0">{{ item.bookTitle }}</v-card-text>
            <v-card-text class="text-center text-caption text-truncate grey-lighten-1 mb-2 mx-1 mt-0 pa-0">{{ item.author}}</v-card-text>
        </v-card>
        </v-col>
    </v-row>

        <div class="align-center mt-4">
            <v-pagination 
            v-if="myBooks.length > 0" 
            class="m-2"
            v-model="currentPage"
            :length="getPageCount"
            :total-visible="4">
            </v-pagination>
        </div>
   </v-container>
    `,
    mounted(){
        this.getBooks();
    }

};
