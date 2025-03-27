let partyData = [];

window.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  const loop = document.getElementById('loop');
  const textbox = document.getElementById('textbox');
  const textboxText = document.getElementById('textbox-text');
  const startBtn = document.getElementById('start-btn');
  const spawnMask = document.getElementById('spawn-mask');
  const partyContainer = document.getElementById('party-container');
  const battleMenu = document.getElementById('battle-menu');

  const dialogueLines = [
    "THE CLOUD OF DARKNESS APPROACHES.",
    "ITS MALICE FILLS THE VOID...",
    "THE FINAL BATTLE BEGINS!"
  ];

  const partyClasses = [
    { name: 'blackmage', src: 'blackmage.png' },
    { name: 'ninja', src: 'ninja.png' },
    { name: 'devout', src: 'devout.png' }
  ];

  function generateParty(count = 4) {
    partyContainer.innerHTML = '';
    const party = [];
  
    // Always include one devout
    const devoutImg = document.createElement('img');
    devoutImg.src = 'devout.png';
    devoutImg.alt = 'devout';
    devoutImg.className = `party-sprite devout hidden`;
    devoutImg.style.width = '48px';
    devoutImg.style.imageRendering = 'pixelated';
    partyContainer.appendChild(devoutImg);
  
    const devoutHP = Math.floor(Math.random() * 500) + 3800;
    party.push({
      name: 'devout',
      sprite: devoutImg,
      maxHP: devoutHP,
      currentHP: devoutHP
    });
  
    // Now generate the rest (count - 1)
    for (let i = 1; i < count; i++) {
      const job = partyClasses[Math.floor(Math.random() * partyClasses.length)];
      
      const img = document.createElement('img');
      img.src = job.src;
      img.alt = job.name;
      img.className = `party-sprite ${job.name} hidden`;
      img.style.width = '48px';
      img.style.imageRendering = 'pixelated';
      partyContainer.appendChild(img);
  
      const maxHP = Math.floor(Math.random() * 500) + 3800;
  
      party.push({
        name: job.name,
        sprite: img,
        maxHP,
        currentHP: maxHP
      });
    }
  
    return party;
  }
  
  

  function typeDialogue(lines, speed = 40) {
    let index = 0;

    function typeLine(line, onComplete) {
      let charIndex = 0;
      textboxText.textContent = '';

      const interval = setInterval(() => {
        textboxText.textContent += line.charAt(charIndex);
        charIndex++;
        if (charIndex === line.length) {
          clearInterval(interval);
          setTimeout(onComplete, 6500);
        }
      }, speed);
    }

    function nextLine() {
      if (index < lines.length) {
        typeLine(lines[index], nextLine);
        index++;
      } else {
        textbox.classList.add('hidden');
        battleMenu.classList.remove('hidden');
        const partySprites = document.querySelectorAll('.party-sprite');
        startRandomAttacks(partySprites);
      }
    }

    textbox.classList.remove('hidden');
    nextLine();
  }

  function showDamage() {
    const damage = document.createElement('div');
    damage.className = 'damage-number';
    damage.textContent = Math.floor(Math.random() * 9999);
    document.body.appendChild(damage);

    damage.style.left = '10%';
    damage.style.top = '30%';

    setTimeout(() => {
      damage.classList.add('animate');
    }, 10);

    setTimeout(() => {
      damage.remove();
    }, 1400);

    return damage;
  }

  function triggerFlareWave() {
    const flash = document.getElementById('screen-flash');
    const wrapper = document.getElementById('game-wrapper');
    const party = document.querySelectorAll('.party-sprite');
    const flareSfx = document.getElementById('flarewave-sfx');
    const actionBox = document.getElementById('enemy-action');

    actionBox.classList.remove('hidden');
    actionBox.textContent = 'FlareWave';

    setTimeout(() => {
      actionBox.classList.add('hidden');
    }, 1200);

    flareSfx.currentTime = 0;
    flareSfx.play();

    flash.classList.remove('hidden');
    flash.classList.add('flash');
    wrapper.classList.add('shake');
    setTimeout(() => {
      flash.classList.remove('flash');
      flash.classList.add('hidden'); // hides it again
      wrapper.classList.remove('shake');
    }, 700); // match the animation duration


    partyData.forEach((p, i) => {
    setTimeout(() => {
    const dmgAmount = Math.floor(Math.random() * 2000 + 1000);
    p.currentHP = Math.max(p.currentHP - dmgAmount, 0);

    const dmg = document.createElement('div');
    dmg.className = 'damage-number';
    dmg.textContent = dmgAmount;
    document.body.appendChild(dmg);

    const rect = p.sprite.getBoundingClientRect();
    dmg.style.left = `${rect.left - 50}px`;
    dmg.style.top = `${rect.top}px`;

    setTimeout(() => dmg.classList.add('animate'), 10);
    setTimeout(() => dmg.remove(), 1300);
  }, i * 300); // stagger per character
});

    
    // Update display after all damage
    setTimeout(updatePartyHPDisplay, 1400);
    setTimeout(maybeCastCure3, 1600); // Wait until after the damage is shown


    setTimeout(() => {
      flash.classList.remove('flash');
      wrapper.classList.remove('shake');
    }, 300);
  }

  function startRandomAttacks(partySprites) {
    setInterval(() => {
      if (Math.random() < 0.3) {
        triggerFlareWave();
        return;
      }

      const attacker = partySprites[Math.floor(Math.random() * partySprites.length)];
      const rect = attacker.getBoundingClientRect();

      const fightBox = document.createElement('div');
      fightBox.className = 'fight-box show';
      fightBox.textContent = 'FIGHT';
      document.body.appendChild(fightBox);

      const hitHurtSfx = document.getElementById('hithurt-sfx');
      hitHurtSfx.currentTime = 0;  // Reset to start
      hitHurtSfx.play();

      fightBox.style.left = `${rect.left + window.scrollX - 50}px`;
      fightBox.style.top = `${rect.top + window.scrollY - 50}px`;

      attacker.classList.add('attack');
      attacker.classList.remove('retreat');

      const dmgElement = showDamage();

      setTimeout(() => {
        attacker.classList.remove('attack');
        attacker.classList.add('retreat');

        fightBox.classList.remove('show');
        setTimeout(() => {
          fightBox.remove();
        }, 300);
      }, 1400);
    }, 3000 + Math.random() * 3000);
  }

  function updatePartyHPDisplay() {
    const menuRight = document.querySelector('.party-box');
    if (!menuRight) return;
  
    menuRight.innerHTML = '<p><strong>HP</strong></p>';
  
    partyData.forEach(p => {
      const row = document.createElement('div');
      row.className = 'hp-row';
  
      const nameSpan = document.createElement('span');
      nameSpan.className = 'hp-name';
      nameSpan.textContent = capitalize(p.name);
  
      const hpSpan = document.createElement('span');
      hpSpan.className = 'hp-value';
      hpSpan.textContent = `${p.currentHP}/${p.maxHP}`;
  
      row.appendChild(nameSpan);
      row.appendChild(hpSpan);
      menuRight.appendChild(row);
    });
  }
  
  

  function maybeCastCure3() {
    const hasDevout = partyData.some(p => p.name === 'devout');
    const someoneHurt = partyData.some(p => p.currentHP < p.maxHP);
  
    if (hasDevout && someoneHurt) {
      const cureSfx = document.getElementById('cure-sfx');
      cureSfx.currentTime = 0; // Reset audio to start
      cureSfx.play();

      // Display Cure3 box above devout
      const devout = partyData.find(p => p.name === 'devout');
      const rect = devout.sprite.getBoundingClientRect();
  
      const spellBox = document.createElement('div');
      spellBox.className = 'fight-box show';
      spellBox.textContent = 'Cure3';
      document.body.appendChild(spellBox);
      spellBox.style.left = `${rect.left + window.scrollX - 40}px`;
      spellBox.style.top = `${rect.top + window.scrollY - 50}px`;
  
      // Heal everyone
      partyData.forEach((p, i) => {
  setTimeout(() => {
    const healAmount = Math.floor(Math.random() * 2000) + 8000;
    p.currentHP = Math.min(p.currentHP + healAmount, p.maxHP);

    const heal = document.createElement('div');
    heal.className = 'damage-number heal';
    heal.textContent = `+${healAmount}`;
    document.body.appendChild(heal);

    const rect = p.sprite.getBoundingClientRect();
    heal.style.left = `${rect.left - 50}px`;
    heal.style.top = `${rect.top}px`;

    setTimeout(() => heal.classList.add('animate'), 10);
    setTimeout(() => heal.remove(), 1300);
  }, i * 300); // same delay
});

  
      // Cleanup Cure3 box
      setTimeout(() => {
        spellBox.remove();
      }, 1400);
  
      // Update display
      setTimeout(updatePartyHPDisplay, 1500);
    }
  }
  

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);  
  }
  
  startBtn.addEventListener('click', () => {
    partyData = generateParty();
    updatePartyHPDisplay();

    intro.play();
    spawnMask.classList.remove('hidden');

    startBtn.style.opacity = '0';
    setTimeout(() => {
      startBtn.style.display = 'none';
    }, 500);

    setTimeout(() => {
      typeDialogue(dialogueLines, 40);
      const partySprites = partyData.map(p => p.sprite);

      console.log('Party members:', partySprites);

      partySprites.forEach((sprite, i) => {
        sprite.classList.remove('hidden');
        setTimeout(() => {
          sprite.classList.add('animate-in');
          if (i === 0) sprite.classList.add('first-in-line');
        }, i * 300);
      });
    }, 1000);

    intro.addEventListener('ended', () => {
      loop.play();
    });
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const volumeSlider = document.getElementById('volume-slider');
  const cureSfx = document.getElementById('cure-sfx');
  const flareSfx = document.getElementById('flarewave-sfx');
  const backgroundMusic = document.getElementById('loop');
  const backgroundMusic2 = document.getElementById('intro');
  const hithurt = document.getElementById('hithurt-sfx');

  volumeSlider.addEventListener('input', () => {
    const volume = volumeSlider.value; 
    cureSfx.volume = volume;  
    flareSfx.volume = volume; 
    backgroundMusic.volume = volume;
    backgroundMusic2.volume = volume;
    hithurt.volume = volume;
  });

  cureSfx.volume = volumeSlider.value;
  flareSfx.volume = volumeSlider.value;
});
