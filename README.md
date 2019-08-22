# RedditMemeExplain

PURPOSE: 

I like to browse reddit, but I have no idea what half of the stupid inside references are. To fix this I wanted something that would highlight the obscure jokes and provide a link to KnowYourMeme.com so that I can understand what obscure reference someone mentioned.

Breakdown of the project:
1. Webscraping KnowYourMeme so I can get a list of memes that I would check comments against
2. Reading reddit comments and replacing text
3. Data Structures / Optimizations
4. Todo

___________________________
<b>1. Webscraping</b>

To start, I had to set up some way of scraping data from knowyourmeme.com. The first step was identifying the data I wanted. This was as simple as using the inspection tool on "https://knowyourmeme.com/memes/page/1" and finding the element that contained the memes on the page. From this I calculated the number of pages I'd have to flip through to scrape all the information (as of writing, there are 4109 confirmed memes. 16 Per page means I need to check 4109/16 rounded up pages).

Next, I set up the Puppeteer javascript library to do the actual web scraping. It would load a page, scrape the information, add it to an array, and then load the next page. I did run into some issues with my IP being banned, however the blacklist on their website didn't work and I would just close the browser and reload from where I left off without an issue. In addition, I found that I was only able to go approximatly 150 pages before being banned if I only ran 1 continuous browser. However, if I only loaded 14 pages, closed the browser and started from where I left off, repeating every 14, I found that I could go for approximatly 400 pages before being banned.
___________________________
<b>2. Reading reddit comments and replacing text.</b>

The set up to this is fairly similar to step 1. It was just as simple as finding the text I wanted to scrape off of the web page and then just writing it into code. Inserting the hyperlink was also simple, just inserting the "a href" information around the word I wanted.
___________________________
<b>3. Data Structures / Optimizations</b>

For future reference, I am going to use two terms to describe two large sets of data involved with the project

The List of Memes: The full list of all of the memes scraped from step 1
All the Comments on a Page: The full list of all of the text from comments on a given reddit page

The naive way to approach this problem would be to build a dictionary of the list of memes and make a reference to it everytime to check if some given text is within the list of memes. However, we would need to check every single subsequence to be able to know for a fact if a given text within all the comments on a page is a meme. The time complexity for this can be calculated as such:

Let n = the length of a given comment within All the comments on a page
Let m = the length of All the comments on a page

n will always be greater than m by a fairly large margin

Given a phrase, "The dog is cute", the total number of subsequences for this would be 10. IE "The", "dog", "is", "cute", "The dog", "dog is", "is cute", "The dog is", "dog is cute", "The dog is cute". From observation, I found that the toal number of subsequences is equal to the sum of all numbers from the length of the word to 0. IE in this case it would be 4 + 3 + 2 + 1. If this were 5 words long it would be 5 + 4 + 3 + 2 + 1 = 15. 

This can be generalized as:

S = 1 + 2 + 3 + 4 + ... + (n - 1) + n
Backwards, this would be:
S = n + (n - 1) + ... + 4 + 3 + 2 + 1

If we add the two together we get

2S = (n + 1) + (n + 1) + (n + 1) + (n + 1) + ... + (n + 1) + (n + 1)

The total number of (n + 1) above is equal to n. So, if we sum all of the n above we get n*n and if we sum all of the 1 together we get n.
Solving for S gives us our time complexity to solve a given phrase as 

O((n^2 + n) / 2) which can just be simplified to O(n^2)

Factoring in for m it is O(mn^2) where n >>> m
___________________________
This is of course if I had chosen to do it as a dictionary that needed to check every subsequence. But, we can make this easier. Instead of using a dictionary, I used a tree. The tree is important as I could check the first word of a given comment, determine if it's in the dictionary and use it or discard it based on if it is present and then update the parameters of the subsequence accordingly.

Lets say the our List of Memes is actually just two phrases. "The dog is cute" and "The dog is small". From this I would generate the following tree

<a href="https://imgur.com/a/c5iaSsg">Diagram of the generated tree</a>

Now, lets say we have a list of comments that is in itself only one comment long. The single comment from the reddit page reads "I can't believe how high the dog jumps lol"

First, we initialize our pointer to be start: 0 , end: 1. This results in us checking the phrase "I" against root's children values. The phrase "I" is not in the above dictionary, so we set the start to equal end and increment the end pointer.

Now, start: 1 and end: 2. This results in us checking the phrase "can't" against the root's children. It is not in the dictionary again, so we now set the value of start to equal end and incrememnt end.

This continues on until start: 5 and end: 6. At this point we see that the value passed is "the". This value exists as a child of the root of the tree. We set the new (temporary only for this search) root to equal the "the" node and push the phrase "the" out of the words we are looking for. However, that means that we are currently out of terms to check for so we check if we are at the end of a phrase. We are not, so we return true but DO NOT highlight any text. The end index is incremented only.

Now, start: 5 and end: 7. This yields the subsequence "the dog". First we check for the word "the" against the root's children. It exists, so we set the new root to be the "the" node and make the new word to search for "dog". The term "dog" exists as a child of the "the" node so now the new root is the "dog" node. At this point we have no more terms to look for so we check the isEnd value and see that it is false, so we return true but DO NOT highlight any text. The end index is incremented only.

Now, start: 5 and end: 8. This yields the subsequence "the dog jumps" Again, we check the root node, followed up the "the" node and get to the "dog" node. At this point we check if "jumps" is a child of the "dog" node. It is not, so we stop here and return false. We set the value of the start index to equal the end and increment the end value.

Now, start: 8 and end: 9. This yields the subsequence "lol". We do what we did in the first step.

At this point, we are done.

All together, this is done in O(mn) time.
___________________________

While processing the data on a page, I created a set that kept track of all the comments that I was (each comment has a unique id in the html) so that I wouldn't check the same comment twice. However, if the user left a page, the dictionary was cleared as I'd have to rewrite over the comment once again.
___________________________

Further (but not implemented): 

We only need to check the last word of a given phrase passed to the tree. IE from the example above, we check 'the' before 'dog' but we already know 'the' is acceptable. So, before we would see the nodes "The" -> "The" -> "dog" -> "The" -> "dog" -> "jumps (technically undef)" to be just "The" -> "dog" -> "jumps". The speed optimization would lower the number of times we need to search the tree, however this would be a fairly small reduction (IE maybe 10 less checks per page)
___________________________
<b>Todo</b>

The tree provided is uploaded with the extension. I want to just pull it from a web end point that I set up so that it is up to date. The data should be updated once a day. I intend to use AWS to run the code I used to get the data as well as generate the tree and set it as the data that the extension will use.

