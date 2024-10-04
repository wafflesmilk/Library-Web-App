const Home = {
  template: `
  <v-container fluid class="home">
    <div>
      <v-text-field class="bg-white"
        color="light-blue-lighten-3"
        label="Search for a book"
        v-model="searchTerm"
        clearable
        placeholder="Search by keyword, title, or author"
        
        variant="outlined"
        @keyup.enter="search(searchTerm)">
        <template v-slot:append-inner>
          <v-icon color="light-blue-lighten-1" icon="mdi-magnify"></v-icon>
        </template>
      </v-text-field>
      <p v-if="!searchTerm && searchResults.length == 0" class="gray font-italic text-center">Search for a book using the search bar above!</p>
    </div>
    
    <div class="d-flex align-center justify-center mt-16" v-if="loading">
      <v-progress-circular
        indeterminate 
        size="40"
        color="light-blue-lighten-3">
      </v-progress-circular>
    </div>

    <v-container fluid v-if="resultMsg">
      <p class="font-italic gray">{{resultMsg}}</p>

      <div class="my-4 pa-0" v-if="searchResults.length > 0">
        <v-btn prepend-icon="mdi-filter">Filter
          <v-menu activator="parent" offset-y bottom>
            <v-list>
              <v-list-item @click="filter('Title')">Title</v-list-item>
              <v-list-item @click="filter('Author')">Author</v-list-item>
            </v-list>
          </v-menu>
        </v-btn>

        <v-chip v-if="filtered"
          class="ma-3" 
          color="light-blue-lighten-3"
          variant="elevated"
          closable
          @click:close="clearFilter">{{filterTerm}}</v-chip>
      </div>

      <v-row class="justify-space-between align-center">
        <v-col v-for="item in getItems" :key="item.key" lg="2" md="3" sm="4" class="my-lg-3">
        <v-card 
          hover 
          :width="150" 
          :height="320" 
          :rounded="0"
          >
          <v-img 
          :src="'https://covers.openlibrary.org/b/id/' + item.cover_i + '-L.jpg'" 
          cover 
          :width="150" 
          :height="220"
          >
          </v-img>

          <v-card-text class="text-wrap text-center text-subtitle-2 text-truncate black mx-1 mt-1 pa-0">{{ item.title || 'Unknown Title' }}</v-card-text>
          <v-card-text class="text-center text-caption text-truncate grey-lighten-1 mb-2 mx-1 mt-0 pa-0">{{ item.author_name && item.author_name[0] || 'Unknown Author' }}</v-card-text>

          <div class="d-flex justify-center align-center">
            <v-btn :prepend-icon="item.added ? 'mdi-check' : 'mdi-book-plus-outline'" :disabled="item.added">
            <span v-if="item.added">Added</span>
            <span v-else>Add</span>
              <v-menu activator="parent" transition="slide-y-transition"
              bottom>
                <v-list>
                  <v-list-item @click="Add(item,'want-to-read')">Want to Read</v-list-item>
                  <v-list-item @click="Add(item,'currently-reading')">Currently Reading</v-list-item>
                  <v-list-item @click="Add(item,'read')">Read</v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </div>
      </v-card>
        </v-col>
      </v-row>

      <div class="align-center mt-4">
        <v-pagination 
          v-if="searchResults.length > 0" 
          class="m-2"
          v-model="currentPage"
          :length="getPageCount"
          :total-visible="4">
        </v-pagination>
      </div>
    </v-container>
  </v-container>
  `,
  
  data() {
    return {
      loading: false, //for progress-circular component  
      searchTerm: '',
      searchResults: [],
      filteredResults: [],
      filterTerm: '',
      filtered: false,
      resultMsg: '', 
      perPage: 18,
      currentPage: 1,
      added: false //for disabling add button once book has been added to a list 
    };
  },
  computed: {
    // Returns the data according to the page number
    getItems() {
      let start = (this.currentPage - 1) * this.perPage;
      let end = start + this.perPage;
      if (this.filtered) {
        return this.filteredResults.slice(start, end);
      }
      return this.searchResults.slice(start, end);
    },
    // Returns total number of pages required according to the total rows of data
    getPageCount() {
      if (this.filtered) {
        return Math.ceil(this.filteredResults.length / this.perPage);
      }
      return Math.ceil(this.searchResults.length / this.perPage);
    }
  },
  methods: {
    //filter function
    filter(filterTerm) {
      this.filtered = true;
      this.filterTerm = filterTerm;
      if (filterTerm === 'Title') {
        this.filteredResults = this.searchResults.filter(item => {
          return item.title && item.title.toLowerCase().includes(this.searchTerm.toLowerCase());
        });
      } else if (filterTerm === 'Author') {
        this.filteredResults = this.searchResults.filter(item => {
          return item.author_name && item.author_name.some(author => author.toLowerCase().includes(this.searchTerm.toLowerCase()));
        });
      }
      // Reset pagination when filtering
      this.currentPage = 1;
    },

    clearFilter() {
      this.filtered = false; //reset all filter variables
      this.filterTerm = '';
      this.filteredResults = [];
      this.currentPage = 1;
    },
    //search function
    search(searchTerm) {
      this.loading = true;
      const lowerCaseTerm = searchTerm.toLowerCase();
      const searchWords = lowerCaseTerm.split(/\s+/); // Splitting by whitespace
      const query = searchWords.join('+');
      //construct request to the API  
      const url = `https://openlibrary.org/search.json?title=${query}`;
    
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })

        .then(data => {
          // Filter out duplicate titles
          const uniqueTitles = new Set();
          this.searchResults = data.docs.filter(item => {
            const title = item.title.toLowerCase();
            if (!uniqueTitles.has(title)) {
              uniqueTitles.add(title);
              return true;
            }
            return false;
          }).map(item => ({ ...item, added: false }));
    
          this.loading = false; //results have been fetched, stop the loading component

          //set the result msg accordingly 
          if (this.searchResults.length > 0) {
            this.resultMsg = `Showing results for '${this.searchTerm}'`;
          } else {
            this.resultMsg = `No results found for '${this.searchTerm}'`;
          }
          this.currentPage = 1; // Reset to the first page whenever a new search is performed
        })


        .catch(error => {
          this.resultMsg = error.message;
        });
    },    

    Add(item, option) {
      const id = (item.key).slice(7); // book key is in the format /works/[key]
      const username = this.$route.params.username;
  
      // Check if the book already exists in the books table using bookID
      fetch(`resources/apis.php/books/bookID/${id}`)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(data => {
              if (data.length === 0) {
                  // Construct a request to add book to book table
                  const requestOptions = {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                          bookTitle: item.title,
                          img: item.cover_i,
                          author: item.author_name[0],
                          bookID: id
                      })
                  };
                  return fetch('resources/apis.php/books', requestOptions)
                      .then(response => {
                          if (!response.ok) {
                              throw new Error('Network response was not ok');
                          }
                          return response.json();
                      })
                      .catch(error => {
                          alert("Failed to add book to books table. Error: " + error);
                          throw error; // Re-throw error to prevent further execution
                      });
              }
          })
          .then(() => {
              // Check if the bookID and username already exist in user_books
              return fetch(`resources/apis.php/user_books/bookID/${id}/username/${username}`)
                  .then(response => {
                      if (!response.ok) {
                          throw new Error('Network response was not ok');
                      }
                      return response.json();
                  })
                  .then(data => {
                      if (data.length > 0) {
                          alert(`Book is already in the '${data[0].type}' list!`);
                          return false; // Indicate that the book is already in the list
                      }
                      return true; // Indicate that the book is not in the list
                  });
          })
          .then(shouldAdd => {
              if (!shouldAdd) return; // second POST request is not executed since book is already in a list
  
              // Construct another request to link book to user
              const requestOptions = {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      bookID: id,
                      username: username,
                      type: option,
                      progress:0
                  })
              };
  
              return fetch('resources/apis.php/user_books', requestOptions)
                  .then(response => {
                      if (!response.ok) {
                          throw new Error('Network response was not ok');
                      }
                      return response.json();
                  })
                  .then(data => {
                      alert(`Successfully added book to '${option}' list!`);
                      item.added = true; //disables add button so user cannot add book to any other list 
                  })
                  .catch(error => {
                      alert(`Failed to add book to '${option}' list.` + error);
                  });
          })
          .catch(error => {
              if (error.message !== 'Book already exists in list') {
                  alert("Failed to complete the process. Error: " + error);
              }
          });
  }
  

  }
};

