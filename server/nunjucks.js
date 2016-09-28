import { templates } from 'g-ui/dist';
import * as filters from './lib/filters';
import color from '../layouts/color';

export function configure() {
  const env = templates.configure(['views'], {
    filters,
  });
  Object.assign(env.globals, {
    color,
  });
  return env;
}

export const env = configure();

export const render = env.render.bind(env);
