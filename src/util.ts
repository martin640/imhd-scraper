export const loadVarsFromEval = function <T extends object>(script: string): Partial<T> {
    const __r: any = { } as any
    
    const scope: Record<string, any> = {}
    eval(script.replace(/(var|const|let)\s+([\w_]+)/g, "scope.$2"))
    
    const __regex = /(var|const|let)\s+([\w_]+)/gm
    let __match: RegExpExecArray | null
    while (__match = __regex.exec(script)) {
        if (__match[2] in scope) {
            __r[__match[2]] = scope[__match[2]]
        }
    }
    
    return __r as Partial<T>
}

export const timePrettyFormat = (t: number): string => {
    if (t >= 1000000) {
        const date = new Date(t)
        date.setHours(0, 0, 0, 0)
        t -= date.getTime()
    }
    t /= 1000
    
    const hr = Math.floor(t / 3600)
    const min = Math.floor((t % 3600) / 60)
    return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}
