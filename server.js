const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { readFileSync } = require('fs');
const path = require('path');
const {parse} = require('csv-parse/sync')
const typeDefs = readFileSync(path.join(__dirname, './types/schemas.graphql')).toString('utf-8');
let data = parse(readFileSync(path.join(__dirname, './data/pollution_us_2000_2016.csv')), {columns: true, cast: true});

data = data.map(d => {
  const whiteSpaceEntries = Object.entries(d).reduce((acc, entry) => {
    const [key, value] = entry;
    if (key.includes(' ')) acc[key.split(' ').join('_')] = value;
    return acc;
  }, {});

  return {
    ...d,
    ...whiteSpaceEntries,
  }
})

console.log(data[0]);

const resolvers = {
  Query: {
    allRecords: () => data,
    recordsByState: (root, args, context) => data.filter(m => m.State === args.State),
  }
}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({url}) => console.log(`🚀  Server ready at: ${url}`));