const ToRead = {
    template:`
    <v-container fluid class="to-read">
    <div v-if="myBooks.length == 0">
         <p class=" font-italic text-center text-body d-flex flex-column justify-center">No books here at the moment! Head to the home page to add books.</p>
    </div>
     <v-row v-else class="justify-start align-center">
         <v-col v-for="item in getItems" :key="item" lg="2" md="3" sm="4" class="my-lg-3">
         <v-card 
             hover 
             :width="150" 
             :height="310" 
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
             <div class="d-flex justify-center align-center">
                 <v-btn size="small" class="justify-center align-center ma-2">Edit
                 <v-menu activator="parent" transition="slide-y-transition" bottom>
                    <v-list>
                    <v-list-item @click="Start(item)">Start Reading</v-list-item>
                    <v-list-item @click="Remove(item)">Remove</v-list-item>
                    </v-list>
                </v-menu>
                </v-btn>
             </div>
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
                const Books = (data.filter(item => item.type == 'want-to-read'));
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
        },

        Remove(book) {
            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
           
            fetch(`resources/apis.php/user_books/bookID/${book.bookID}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log('Successfully removed book.')
                    this.myBooks = this.myBooks.filter(item => item.bookID !== book.bookID);
                })
                .catch(error => {
                    alert('Could not remove book. ' + error);
                });
        },

        Start(book) {
            const username = this.$route.params.username;
            const bookID = book.bookID;
            
            fetch(`resources/apis.php/user_books/bookID/${book.bookID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type:'currently-reading'
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Book type updated successfully.')
                this.myBooks = this.myBooks.filter(item => item.bookID !== book.bookID);
            })
            .catch(error => {alert('Failed to update book type. ' + error)});
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

    mounted(){
        this.getBooks();
    }

};
