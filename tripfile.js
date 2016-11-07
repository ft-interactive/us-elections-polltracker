import Directory from 'exhibit-directory';
import { compose, plugin } from 'exhibit';
import cssnano from 'cssnano';

const client = new Directory('client', { log: true });
const dist = new Directory('dist', { log: true });

const transform = compose(
  plugin('sass', { root: 'client', loadPaths: ['bower_components'] }),
  plugin('autoprefixer', 'last 2 versions'),
  plugin('babel', { root: 'client' }),
  plugin('browserify', { root: 'client' }),
);

const minify = compose(
  plugin('uglify'),
  plugin('postcss', cssnano(), { map: false }),
);

export const build = async () => {
  await client.read().then(compose(
    transform,
    minify,
    dist.write
  ));
};

export const watch = async () => {
  await client.watch(compose(
    transform,
    dist.write,
  ));
};
