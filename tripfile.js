import Directory from 'exhibit-directory';
import { compose, plugin } from 'exhibit';

const client = new Directory('client', { log: true });
const dist = new Directory('dist', { log: true });

const transform = compose(
  plugin('sass', { root: 'client', loadPaths: ['bower_components'] }),
  plugin('autoprefixer', 'last 2 versions'),
);

export const build = async () => {
  await client.read().then(transform).then(dist.write);
};

export const watch = async () => {
  await client.watch(compose(
    transform,
    dist.write,
  ));
};
