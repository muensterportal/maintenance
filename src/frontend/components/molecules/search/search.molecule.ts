const getNumOfProjects = (tables: NodeListOf<HTMLElement>) => {

    for(const table of tables){
        const rows = table.querySelectorAll(' tbody [data-project]:not(.hidden)');
        table.setAttribute('data-rows', `${rows.length}`);
        const foundDiv = table.querySelector('[data-found] span');
        if(foundDiv){
            foundDiv.innerHTML = rows.length.toString();
        }
        if(rows.length === 0){
            table.classList.add('hidden');
        } else {
            table.classList.remove('hidden');
        }
        
    }
}

export const createSearch = (target: string, uid: string, source: string) => {
    const searchArea = document.querySelector(`[${target}="${uid}"]`);
    const tables = document.querySelectorAll('[data-projects]') as NodeListOf<HTMLElement>;
    getNumOfProjects(tables);

    const filterIcons = document.querySelectorAll('[data-project-filter]');
    for(const filterIcon of filterIcons){
        filterIcon.classList.add('active');
        const id= filterIcon.getAttribute('data-project-filter');
        const section = document.querySelector(`[data-projects="${id}"]`);
        section?.classList.add('active');

        filterIcon.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const filter = target.getAttribute('data-project-filter');
            const isActive = target.classList.contains('active');
            const section = document.querySelector(`[data-projects="${filter}"]`);
            if(isActive){
                section?.classList.remove('active');
                target.classList.remove('active');
                section?.classList.add('hidden');
            } else {
                section?.classList.add('active');
                target.classList.add('active');
                const activeItems = section?.getAttribute('data-rows');
                if(activeItems !== '0'){
                    section?.classList.remove('hidden');
                    
                }
            }
            // section?.classList.toggle('hidden');
            // section?.classList.toggle('active');
            // target.classList.toggle('active');
        })
    }


    if(searchArea){
        const input: HTMLInputElement | null = searchArea?.querySelector('input')
        input?.addEventListener('keyup', (e) => {
            
            const target = e.target as HTMLInputElement;
            const skills = document.querySelectorAll(source);
            if(target.value === '') {
                // reset search
                for(const skill of skills) {
                    skill.classList.remove('hidden');
                    const valueItem = skill.querySelector('.skill-value');
                    const placeholder = skill.querySelector('.skill-search');
                    valueItem?.classList.remove('hidden');
                    placeholder?.classList.add('hidden')
                }
            } else {
                let i = 0;
                const sections = document.querySelectorAll('[data-projects]');
                for(const section of sections){
                    // section.classList.add('hidden');
                    const skills = section.querySelectorAll(source);
                    for(const skill of skills) {
                        const valueItem = skill.querySelector('.skill-value') as HTMLElement;
                        const placeholder = skill.querySelector('.skill-search') as HTMLElement;
                        const skillValue: string = valueItem?.innerText;
                        if(skill.textContent?.toLowerCase().includes(target.value.toLowerCase())) {
                            skill.classList.remove('hidden');
                            valueItem?.classList.add('hidden')
                            skill.querySelector('.skill-search')?.classList.remove('hidden')
                            if(placeholder){
                                const html = getHighlightedText(skillValue, target.value)
                                placeholder.innerHTML = `${html}`
                            }
                            i += 1;
                        } else {
                            valueItem?.classList.remove('hidden')
                            placeholder?.classList.add('hidden');
                            skill.classList.add('hidden');
                            // placeholder.innerHTML = '';
                        }
                    }
                }

                
                const noResultItem: HTMLElement | null = searchArea?.querySelector('.search__no-result');
                if(noResultItem){
                    const searchItem: HTMLElement | null = noResultItem.querySelector('.search__value');
                    if(i === 0){
                        if(searchItem !== null){
                            searchItem.innerText = `${target.value}`;
                        }
                        noResultItem?.classList.remove('search__info--hidden');
                    } else {
                        noResultItem?.classList.add('search__info--hidden')
                    }
                }
                
                
            }
            getNumOfProjects(tables);
        });
    }
}

export const getHighlightedText = (text: string, searchTerm: string) => {
    if(searchTerm === '') return text;
    // Split the text by the highlight term
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? `<span class="search-match">${part}</span>` : part
    ).join('');
}
