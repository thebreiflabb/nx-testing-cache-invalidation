# nx-testing-cache-invalidation

This repo shows potential weird caching behaviour in NX

## Testing with current setup

Initialize the project

```shell
git clone https://github.com/thebreiflabb/nx-testing-cache-invalidation.git
cd nx-testing-cache-invalidation
pnpm install
```

1. On main branch, run the commands to prime the NX cache

```shell
pnpm nx test @myorg/tool-1
pnpm nx build @myorg/tool-1
pnpm nx typecheck @myorg/tool-1
pnpm nx lint @myorg/tool-1
```

2. Switch to use the branch `test-change-runtime-dep` - where the only change is upgrading the `uuid` dependency from `11.0.3` to `11.0.4` (note the package.json is not changed, as the version specifier remains to be `^11.0.3`) [PR can be seen here](https://github.com/thebreiflabb/nx-testing-cache-invalidation/pull/4/files)

```shell
git checkout test-change-runtime-dep
pnpm install
```

Run the commands once again, here we would expect cache MISSES at the very least for `test`, `build` and `typecheck` as they can all be impacted by an external package.

```shell
pnpm nx test @myorg/tool-1
pnpm nx build @myorg/tool-1
pnpm nx typecheck @myorg/tool-1
pnpm nx lint @myorg/tool-1
```

What we see is that all commands use the cache introduced on `main` branch.

Some investigation seem to indicate that as soon as NX `targetDefaults[target].inputs[x].externalDependencies` is defined, ONLY those dependencies are considered for the cache, as well as all of it's transitive-dependencies, but none of the project dependencies.

If `externalDependencies` is omitted, all of the dependencies in the repo/workspace would be considered, which would invalidate the cache even if packages that are not used by the project would be changed (still better than reusing cache when it shouldn't).

## Testing alternative implementation

Here we will try an alternative to see if we can achieve the wished behaviour, where NX considers all project dependencies by default for all of the commands, with additional considerations for `lint` as it uses the workspace global dependency `eslint` and some plugins.

3. Switch to branch `alternative-main` to act as the new `base` to test NX caching towards, and reset NX cache to be sure we have a fresh starting place.

```shell
git checkout alternative-main
pnpm install
pnpm nx reset
```

Prime the NX cache with each command

```shell
pnpm nx test @myorg/tool-1
pnpm nx build @myorg/tool-1
pnpm nx typecheck @myorg/tool-1
pnpm nx lint @myorg/tool-1
```

4. Switch to use the branch `test-change-runtime-dep-alternative` - where the only change is upgrading the `uuid` dependency from `11.0.3` to `11.0.4` (note the package.json is not changed, as the version specifier remains to be `^11.0.3`) [PR can be seen here](https://github.com/thebreiflabb/nx-testing-cache-invalidation/pull/6/files)

```shell
git checkout test-change-runtime-dep-alternative
pnpm install
```

Run the commands once again, here we would expect cache MISSES at the very least for `test`, `build` and `typecheck` as they can all be impacted by an external package.

```shell
pnpm nx test @myorg/tool-1
pnpm nx build @myorg/tool-1
pnpm nx typecheck @myorg/tool-1
pnpm nx lint @myorg/tool-1
```

All of `test`, `build` and `typecheck` are invalidated, while `lint` still uses the cache. This would be the expected behaviour.

While it might not be an intended usage in NX, the configuration made for this is made to use all the current project dependencies for the cache input, an no other dependencies, this is achieved with:

```json
{
  "targetDefaults": {
    "build": {
      "inputs": [
        {
          "input": "self",
          "dependencies": true
        },
        {
          "externalDependencies": []
        }
      ]
    }
  }
}
```

[PR can be seen here](https://github.com/thebreiflabb/nx-testing-cache-invalidation/pull/5/files)

We should clarify if this kind of setup is fine to depend on, and also see if it could be possible to have a more native way to allow specifying only all project level dependencies, through something like this:

```json
{
  "targetDefaults": {
    "build": {
      "inputs": [
        {
          "dependencies": "self"
        }
      ]
    }
  }
}
```
