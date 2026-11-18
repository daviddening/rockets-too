import { existsSync } from 'node:fs'
import { registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

registerHooks({
    resolve (specifier, context, nextResolve)
    {
        if (specifier.startsWith('.') && context.parentURL)
        {
            const parentPath = fileURLToPath(context.parentURL)
            const candidate = path.resolve(path.dirname(parentPath), specifier)

            for (const ext of ['.ts', '.tsx', '.mjs', '.js'])
            {
                const file = candidate.endsWith(ext) ? candidate : `${candidate}${ext}`

                if (existsSync(file))
                {
                    return { url: pathToFileURL(file).href, shortCircuit: true }
                }
            }
        }

        return nextResolve(specifier, context)
    },
})
