// 게임 상태
const gameState = {
    score: 0,
    chapter: 1, // 현재 챕터
    maxChapter: 3, // 최대 챕터
    postersCollected: 0, // 수집한 포스터 수
    totalPostersPerChapter: 5, // 챕터당 포스터 수
    currentPosterIndex: 0, // 현재 포스터 인덱스 (0부터 시작)
    moveSpeed: 5,
    isRunning: false,
    isPaused: false,
    playerX: 100,
    playerY: 50,
    groundY: 50,
    canvasHeight: 600,
    playerWidth: 40,
    playerHeight: 40,
    velocityY: 0,
    isJumping: false,
    isOnGround: true,
    gravity: 0.8,
    jumpStrength: 16,
    obstacles: [],
    posters: [],
    platforms: [],
    elevators: [], // 엘리베이터 (2챕터)
    hazards: [], // 위험 요소 (가시, 전기 등)
    portal: null,
    gameLoop: null,
    isPressingDown: false, // S 키를 누르고 있는지
    canDropThrough: false, // 플랫폼 통과 가능 상태
    facingDirection: 'left', // 플레이어가 바라보는 방향
    collectedPosters: [],
    sortedPosters: [],
    galleryIndex: 0
};

// 포스터 데이터 (예시 - 실제 이미지 URL로 교체 가능)
const posterData = [
    {
        title: "모네의 수련",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Monet_Water_Lilies_1916.jpg/800px-Monet_Water_Lilies_1916.jpg",
        description: "클로드 모네의 대표작으로, 지베르니 정원의 수련 연못을 그린 작품입니다. 인상주의의 대표적인 작품으로, 빛과 색채의 변화를 섬세하게 표현했습니다."
    },
    {
        title: "별이 빛나는 밤",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
        description: "빈센트 반 고흐의 유명한 작품으로, 1889년에 그려진 작품입니다. 동적인 붓 터치와 강렬한 색채로 밤하늘의 움직임을 표현한 작품입니다."
    },
    {
        title: "기억의 지속",
        image: "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg",
        description: "살바도르 달리의 초현실주의 작품으로, 녹아내리는 시계를 통해 시간의 상대성을 표현한 작품입니다. 1931년에 제작되었습니다."
    },
    {
        title: "진주 귀걸이를 한 소녀",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
        description: "요하네스 베르메르의 대표작으로, '북유럽의 모나리자'라고 불리는 작품입니다. 부드러운 빛과 섬세한 표현이 특징입니다."
    },
    {
        title: "절규",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Scream.jpg/800px-The_Scream.jpg",
        description: "에드바르 뭉크의 표현주의 작품으로, 인간의 불안과 고통을 표현한 작품입니다. 1893년에 제작되었습니다."
    }
];

// DOM 요소
const gameCanvas = document.getElementById('gameCanvas');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const posterModal = document.getElementById('posterModal');
const posterTitle = document.getElementById('posterTitle');
const posterImage = document.getElementById('posterImage');
const posterDescription = document.getElementById('posterDescription');
const continueBtn = document.getElementById('continueBtn');
const closeModal = document.querySelector('.close');
const stageOverlay = document.getElementById('stageOverlay');
const stageTitleEl = document.getElementById('stageTitle');
const stageSubtitleEl = document.getElementById('stageSubtitle');
const chapter1Music = document.getElementById('chapter1Music');
const chapter2Music = document.getElementById('chapter2Music');
const chapter3Music = document.getElementById('chapter3Music');
const jumpSound = document.getElementById('jumpSound');
const stompSound = document.getElementById('stompSound');
const posterSound = document.getElementById('posterSound');
const overSound = document.getElementById('overSound');
const portalSound = document.getElementById('portalSound');
const viewSound = document.getElementById('viewSound');
const posterGallery = document.getElementById('posterGallery');
const galleryImage = document.getElementById('galleryImage');
const galleryDesc = document.getElementById('galleryDesc');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');
const galleryClose = document.getElementById('galleryClose');
const galleryCounter = document.getElementById('galleryCounter');

// 사운드 초기 설정

// 플레이어 생성
function createPlayer() {
    const player = document.createElement('div');
    player.className = 'player';
    player.id = 'player';
    player.classList.add('face-left'); // 기본 방향은 왼쪽
    gameCanvas.appendChild(player);
    updatePlayerPosition();
    // 뛰는 애니메이션 추가
    player.classList.add('running');
}

// 플레이어 위치 업데이트
function updatePlayerPosition() {
    const player = document.getElementById('player');
    if (player) {
        player.style.left = gameState.playerX + 'px';
        player.style.bottom = gameState.playerY + 'px';
        
        // 방향 설정
        if (gameState.facingDirection === 'left') {
            player.classList.add('face-left');
            player.classList.remove('face-right');
        } else {
            player.classList.add('face-right');
            player.classList.remove('face-left');
        }
        
        // 점프 중이면 점프 애니메이션 클래스 추가
        if (gameState.isJumping && !gameState.isOnGround) {
            player.classList.add('jumping');
            player.classList.remove('running');
        } else if (gameState.isOnGround) {
            player.classList.remove('jumping');
            player.classList.add('running');
        }
    }
}

// 장애물 생성 및 초기화
function createInitialObstacles() {
    // 장애물 타입 배열 생성 (챕터별 이미지 세트 사용)
    const obstacleTypes = [];
    const platformCount = gameState.platforms.length - (gameState.chapter === 3 ? 1 : 0);
    const obstacleSet = getObstacleImagesForChapter(gameState.chapter);
    
    // 1~9 전체 세트를 섞어가며 분배 (중복 최소화)
    const queue = buildObstacleTypeQueue(platformCount, obstacleSet);
    obstacleTypes.push(...queue);
    
    // 배열 섞기 (랜덤 배치)
    for (let i = obstacleTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [obstacleTypes[i], obstacleTypes[j]] = [obstacleTypes[j], obstacleTypes[i]];
    }
    
    // 각 플랫폼에 장애물 1개씩 생성
    let typeIndex = 0;
    gameState.platforms.forEach((platform, index) => {
        // 챕터 3의 첫 번째 플랫폼에는 장애물 생성하지 않음 (플레이어 시작 위치)
        if (gameState.chapter === 3 && index === 0) {
            return; // 첫 번째 플랫폼 건너뛰기
        }
        createObstacleOnPlatform(platform, obstacleTypes[typeIndex++]);
    });
}

// 특정 플랫폼에 장애물 생성
function createObstacleOnPlatform(platform, obstacleType = null) {
    const y = platform.y + platform.height + 10;
    const minX = platform.x;
    const maxX = platform.x + platform.width - 40;
    
    // 플랫폼 중앙 근처에 생성
    const startX = minX + (maxX - minX) / 2 - 20 + Math.random() * 40;
    
    const obstacle = document.createElement('div');
    
    // obstacleType이 지정되지 않으면 챕터별 세트에서 랜덤으로 선택
    const setForChapter = getObstacleImagesForChapter(gameState.chapter);
    const imageNum = obstacleType || setForChapter[Math.floor(Math.random() * setForChapter.length)];
    console.log('Creating obstacle with image:', `go${imageNum}.png`);
    
    obstacle.className = 'obstacle-img';
    obstacle.style.position = 'absolute';
    obstacle.style.left = startX + 'px';
    obstacle.style.bottom = y + 'px';
    obstacle.style.width = '40px';
    obstacle.style.height = '40px';
    obstacle.style.zIndex = '4';
    obstacle.style.background = 'none';
    obstacle.style.backgroundColor = 'transparent';
    obstacle.style.backgroundImage = `url("go${imageNum}.png")`;
    obstacle.style.backgroundSize = 'contain';
    obstacle.style.backgroundPosition = 'center';
    obstacle.style.backgroundRepeat = 'no-repeat';
    obstacle.style.border = 'none';
    obstacle.style.boxShadow = 'none';
    obstacle.style.imageRendering = 'auto';
    gameCanvas.appendChild(obstacle);
    
    const obstacleData = {
        element: obstacle,
        x: startX,
        y: y,
        width: 40,
        height: 40,
        velocityX: (Math.random() > 0.5 ? 1 : -1) * 0.5,
        minX: minX,
        maxX: maxX,
        type: imageNum
    };
    
    gameState.obstacles.push(obstacleData);
}

// 챕터별 장애물 이미지 세트
function getObstacleImagesForChapter(chapter) {
    // 모든 챕터에서 1~9를 고르게 사용
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
}

// 플랫폼 개수에 맞춰 장애물 타입 큐 생성 (중복 최소화)
function buildObstacleTypeQueue(count, set) {
    const result = [];
    while (result.length < count) {
        // 세트를 복제 후 섞어서 추가
        const batch = [...set];
        for (let i = batch.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [batch[i], batch[j]] = [batch[j], batch[i]];
        }
        result.push(...batch);
    }
    return result.slice(0, count);
}

// 장애물 생성 (포스터 수집 시 사용)
function createObstacle() {
    // 빈 플랫폼 찾기
    const platformsWithObstacles = new Set(
        gameState.obstacles.map(obs => {
            // 어느 플랫폼 위에 있는지 찾기
            for (let platform of gameState.platforms) {
                if (Math.abs(obs.y - (platform.y + platform.height + 10)) < 5) {
                    return platform;
                }
            }
            return null;
        }).filter(p => p !== null)
    );
    
    // 장애물이 없는 플랫폼에 생성
    const emptyPlatform = gameState.platforms.find(p => !platformsWithObstacles.has(p));
    if (emptyPlatform) {
        createObstacleOnPlatform(emptyPlatform);
    }
}

// 포스터 초기 생성
function createInitialPosters() {
    // 챕터 시작 시 첫 번째 포스터만 생성
    gameState.currentPosterIndex = 0;
    gameState.collectedPosters = [];
    gameState.galleryIndex = 0;
    createPoster();
}

// 포스터 생성
function createPoster() {
    const possibleYPositions = [50];
    gameState.platforms.forEach(platform => {
        possibleYPositions.push(platform.y + platform.height + 10);
    });
    
    let randomY = possibleYPositions[Math.floor(Math.random() * possibleYPositions.length)];
    let randomX = Math.random() * (800 - 40);
    
    // 장애물 위에 생성되지 않도록 위치 재시도
    let attempts = 20;
    while (attempts > 0) {
        const overlaps = gameState.obstacles.some(obs => {
            return randomX < obs.x + obs.width &&
                   randomX + 40 > obs.x &&
                   randomY < obs.y + obs.height &&
                   randomY + 60 > obs.y;
        });
        if (!overlaps) break;
        randomY = possibleYPositions[Math.floor(Math.random() * possibleYPositions.length)];
        randomX = Math.random() * (800 - 40);
        attempts--;
    }
    
    const poster = document.createElement('div');
    poster.className = 'poster';
    poster.style.left = randomX + 'px';
    poster.style.bottom = randomY + 'px';
    
    // 챕터별 포스터 이미지 설정 (순서대로)
    let posterImageName;
    if (gameState.chapter === 1) {
        if (gameState.currentPosterIndex === 0) {
            posterImageName = 'poster.jpg'; // 첫 번째는 poster.jpg
        } else {
            posterImageName = `poster${gameState.currentPosterIndex + 1}.jpg`; // poster2.jpg ~ poster5.jpg
        }
    } else if (gameState.chapter === 2) {
        posterImageName = `poster${gameState.currentPosterIndex + 6}.jpg`; // poster6.jpg ~ poster10.jpg
    } else if (gameState.chapter === 3) {
        posterImageName = `poster${gameState.currentPosterIndex + 11}.jpg`; // poster11.jpg ~ poster15.jpg
    }
    
    poster.style.backgroundImage = `url("${posterImageName}")`;
    
    gameCanvas.appendChild(poster);
    
    const posterDataIndex = Math.floor(Math.random() * posterData.length);
    const posterDataItem = posterData[posterDataIndex];
    
    const posterObj = {
        element: poster,
        x: randomX,
        y: randomY,
        width: 40,
        height: 60,
        data: posterDataItem,
        imageName: posterImageName
    };
    
    gameState.posters.push(posterObj);
}

// 포탈 생성
function createPortal() {
    if (gameState.portal) return; // 이미 포탈이 있으면 생성하지 않음
    
    const portalX = 400 - 30; // 화면 중앙
    const portalY = 300;
    
    const portal = document.createElement('div');
    portal.className = 'portal';
    portal.style.left = portalX + 'px';
    portal.style.bottom = portalY + 'px';
    portal.style.backgroundImage = 'url("mo.png")';
    portal.style.backgroundSize = 'contain';
    portal.style.backgroundPosition = 'center';
    portal.style.backgroundRepeat = 'no-repeat';
    portal.style.border = 'none';
    portal.style.outline = 'none';
    gameCanvas.appendChild(portal);
    
    gameState.portal = {
        element: portal,
        x: portalX,
        y: portalY,
        width: 140,
        height: 200
    };
    
    // 포탈 사운드 재생
    if (portalSound) {
        portalSound.currentTime = 0;
        portalSound.play().catch(err => {
            console.log('포탈 사운드 재생 실패:', err);
        });
    }
}

// 포탈 제거
function removePortal() {
    if (gameState.portal) {
        gameState.portal.element.remove();
        gameState.portal = null;
    }
    
    stopPortalSound();
}

// 충돌 감지
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 챕터별 플랫폼 데이터
function getPlatformData(chapter) {
    if (chapter === 1) {
        // 챕터 1: 기본 구조 (양옆 통과 가능)
        return [
            { x: 0, y: 150, width: 180, height: 20, hazard: false },
            { x: 620, y: 150, width: 180, height: 20, hazard: 'spikes' }, // 가시
            { x: 280, y: 200, width: 150, height: 20, hazard: false },
            { x: 100, y: 300, width: 160, height: 20, hazard: 'electric' }, // 전기
            { x: 540, y: 300, width: 160, height: 20, hazard: false },
            { x: 320, y: 420, width: 180, height: 20, hazard: false }
        ];
    } else if (chapter === 2) {
        // 챕터 2: 더 복잡한 구조
        return [
            { x: 0, y: 120, width: 140, height: 20, hazard: false },
            { x: 660, y: 120, width: 140, height: 20, hazard: 'lava' }, // 용암
            { x: 200, y: 180, width: 130, height: 20, hazard: false },
            { x: 470, y: 180, width: 130, height: 20, hazard: false },
            { x: 50, y: 280, width: 140, height: 20, hazard: 'spikes' }, // 가시
            { x: 610, y: 280, width: 140, height: 20, hazard: false },
            { x: 330, y: 360, width: 140, height: 20, hazard: false },
            { x: 250, y: 480, width: 300, height: 20, hazard: false }
        ];
    } else if (chapter === 3) {
        // 챕터 3: 가장 어려운 구조
        return [
            { x: 0, y: 100, width: 110, height: 20, hazard: false },
            { x: 690, y: 100, width: 110, height: 20, hazard: 'electric' }, // 전기
            { x: 250, y: 120, width: 100, height: 20, hazard: false },
            { x: 450, y: 120, width: 100, height: 20, hazard: 'poison' }, // 독
            { x: 80, y: 220, width: 110, height: 20, hazard: false },
            { x: 610, y: 220, width: 110, height: 20, hazard: false },
            { x: 350, y: 250, width: 100, height: 20, hazard: false },
            { x: 150, y: 350, width: 100, height: 20, hazard: false },
            { x: 550, y: 350, width: 100, height: 20, hazard: false },
            { x: 320, y: 440, width: 160, height: 20, hazard: false },
            { x: 400, y: 520, width: 120, height: 20, hazard: false }
        ];
    }
    return [];
}

// 플랫폼 생성
function createPlatforms() {
    const platformData = getPlatformData(gameState.chapter);
    
    platformData.forEach((platform, index) => {
        const platformEl = document.createElement('div');
        platformEl.className = 'platform';
        
        // 챕터별 플랫폼 설정
        if (gameState.chapter === 1) {
            // 챕터 1: 이미지 사용, 테두리 없음
            platformEl.classList.add('platform-chapter1');
            
            // 플랫폼별 이미지 설정
            let platformImage;
            if (index === 0 || index === 1 || index === 5) {
                // 플랫폼 1번, 2번, 6번
                platformImage = '170.png';
            } else {
                // 플랫폼 3번, 4번, 5번
                platformImage = '150.png';
            }
            
            platformEl.style.backgroundImage = `url("${platformImage}")`;
            platformEl.style.backgroundSize = '100% 100%';
            platformEl.style.backgroundPosition = 'center';
            platformEl.style.backgroundRepeat = 'no-repeat';
            platformEl.style.border = 'none';
            platformEl.style.boxShadow = 'none';
            platformEl.style.borderRadius = '0';
        } else if (gameState.chapter === 2) {
            // 챕터 2: 이미지 사용, 테두리 없음
            platformEl.classList.add('platform-chapter2');
            
            // 플랫폼별 이미지 설정
            let platformImage;
            if (index === 0 || index === 1 || index === 4 || index === 5 || index === 6) {
                // 플랫폼 1번, 2번, 5번, 6번, 7번
                platformImage = '140.png';
            } else if (index === 2 || index === 3) {
                // 플랫폼 3번, 4번
                platformImage = '130.png';
            } else {
                // 플랫폼 8번
                platformImage = '300.png';
            }
            
            platformEl.style.backgroundImage = `url("${platformImage}")`;
            platformEl.style.backgroundSize = '100% 100%';
            platformEl.style.backgroundPosition = 'center';
            platformEl.style.backgroundRepeat = 'no-repeat';
            platformEl.style.border = 'none';
            platformEl.style.boxShadow = 'none';
            platformEl.style.borderRadius = '0';
        } else if (gameState.chapter === 3) {
            // 챕터 3: 플랫폼 크기별 이미지 사용
            platformEl.classList.add('platform-chapter3');
            
            // 플랫폼 너비에 따라 이미지 설정
            let platformImage;
            if (platform.width === 100) {
                platformImage = '100.png';
            } else if (platform.width === 110) {
                platformImage = '110.png';
            } else if (platform.width === 120) {
                platformImage = '120.png';
            } else if (platform.width === 160) {
                platformImage = '160w.png';
            }
            
            const cacheBust = Date.now();
            const platformSrc = `${platformImage}?v=${cacheBust}`;
            platformEl.style.setProperty('background-image', `url("${platformSrc}")`, 'important');
            platformEl.style.setProperty('background-size', '100% 100%', 'important');
            platformEl.style.setProperty('background-position', 'center', 'important');
            platformEl.style.setProperty('background-repeat', 'no-repeat', 'important');
            platformEl.style.setProperty('background-color', 'transparent', 'important');
            platformEl.style.setProperty('background', `url("${platformSrc}")`, 'important');
            platformEl.style.border = 'none';
            platformEl.style.boxShadow = 'none';
            platformEl.style.borderRadius = '0';
        }
        
        platformEl.style.left = platform.x + 'px';
        platformEl.style.bottom = platform.y + 'px';
        platformEl.style.width = platform.width + 'px';
        platformEl.style.height = platform.height + 'px';
        gameCanvas.appendChild(platformEl);
        
        gameState.platforms.push({
            element: platformEl,
            x: platform.x,
            y: platform.y,
            width: platform.width,
            height: platform.height
        });
        
        // 위험 요소가 있는 플랫폼이면 위험 요소 생성
        if (platform.hazard) {
            createHazardOnPlatform(platform);
        }
    });
}

// 플랫폼 위에 위험 요소 생성
function createHazardOnPlatform(platform) {
    const hazardWidth = 40;
    const hazardHeight = 30;
    
    // 플랫폼 크기에 따라 위험 요소 개수 결정 (2-3개)
    const numHazards = platform.width > 120 ? 2 : 1;
    const spacing = platform.width / (numHazards + 1);
    
    for (let i = 0; i < numHazards; i++) {
        // 균등하게 배치하되 약간의 랜덤성 추가
        const hazardX = platform.x + spacing * (i + 1) - hazardWidth / 2 + (Math.random() - 0.5) * 20;
        const hazardY = platform.y + platform.height;
        
        // 플랫폼 범위를 벗어나지 않도록 조정
        const clampedX = Math.max(platform.x, Math.min(hazardX, platform.x + platform.width - hazardWidth));
        
        const hazardEl = document.createElement('div');

        // 챕터/유형별 위험 요소 스타일 매핑
        let hazardClass = `hazard-${platform.hazard}`;
        if (gameState.chapter === 1) {
            if (platform.hazard === 'spikes') hazardClass = 'hazard-spikes-green';
            else if (platform.hazard === 'electric') hazardClass = 'hazard-poison-green';
        } else if (gameState.chapter === 2) {
            if (platform.hazard === 'lava') hazardClass = 'hazard-lava-flat';
        } else if (gameState.chapter === 3) {
            if (platform.hazard === 'electric') hazardClass = 'hazard-spikes-blue';
            else if (platform.hazard === 'poison') hazardClass = 'hazard-skull-blue';
        }

        hazardEl.className = `hazard ${hazardClass}`;
        hazardEl.style.left = clampedX + 'px';
        hazardEl.style.bottom = hazardY + 'px';
        hazardEl.style.width = hazardWidth + 'px';
        hazardEl.style.height = hazardHeight + 'px';
        gameCanvas.appendChild(hazardEl);
        
        gameState.hazards.push({
            element: hazardEl,
            x: clampedX,
            y: hazardY,
            width: hazardWidth,
            height: hazardHeight,
            type: platform.hazard
        });
    }
}

// 플랫폼 충돌 감지
function checkPlatformCollision() {
    const playerScreenY = gameState.canvasHeight - gameState.playerY - gameState.playerHeight;
    const playerRect = {
        x: gameState.playerX,
        y: playerScreenY,
        width: gameState.playerWidth,
        height: gameState.playerHeight
    };
    
    let onPlatform = false;
    let platformTop = gameState.groundY;
    
    gameState.platforms.forEach(platform => {
        const platformScreenY = gameState.canvasHeight - platform.y - platform.height;
        const platformTopY = platformScreenY;
        const platformRect = {
            x: platform.x,
            y: platformScreenY,
            width: platform.width,
            height: platform.height
        };
        
        // 플레이어가 플랫폼 위에 있는지 확인
        const playerBottom = playerRect.y + playerRect.height;
        const isAbovePlatform = playerRect.x + playerRect.width > platformRect.x &&
                               playerRect.x < platformRect.x + platformRect.width;
        
        // 플랫폼 위에 착지
        if (isAbovePlatform) {
            const playerBottom = playerRect.y + playerRect.height;
            const playerTop = playerRect.y;
            
            // 플랫폼 위에 착지 (떨어지는 중이거나 정지 상태일 때)
            // S 키를 누르면 플랫폼 통과 (canDropThrough가 true일 때)
            if (playerBottom >= platformTopY - 25 && 
                playerBottom <= platformTopY + 35 && 
                gameState.velocityY >= -3 &&
                !gameState.canDropThrough) {
                
                onPlatform = true;
                platformTop = platform.y + platform.height;
                // 플랫폼 위에 정확히 위치시키기
                gameState.playerY = platformTop;
                gameState.velocityY = 0;
                gameState.isJumping = false;
                gameState.isOnGround = true;
            }
        }
    });
    
    // 바닥 착지 (하강 중일 때만)
    if (!onPlatform) {
        if (gameState.velocityY >= 0 && gameState.playerY <= gameState.groundY) {
            gameState.playerY = gameState.groundY;
            gameState.velocityY = 0;
            gameState.isJumping = false;
            gameState.isOnGround = true;
            gameState.canDropThrough = false; // 바닥에 닿으면 통과 모드 해제
        } else {
            gameState.isOnGround = false;
        }
    } else {
        // 플랫폼에 착지하면 통과 모드 해제
        gameState.canDropThrough = false;
    }
}

// 엘리베이터 충돌 감지 (챕터 2)
function checkElevatorCollision() {
    const playerScreenY = gameState.canvasHeight - gameState.playerY - gameState.playerHeight;
    const playerRect = {
        x: gameState.playerX,
        y: playerScreenY,
        width: gameState.playerWidth,
        height: gameState.playerHeight
    };
    
    gameState.elevators.forEach(elevator => {
        const elevatorScreenY = gameState.canvasHeight - elevator.y - elevator.height;
        const elevatorTopY = elevatorScreenY;
        const elevatorRect = {
            x: elevator.x,
            y: elevatorScreenY,
            width: elevator.width,
            height: elevator.height
        };
        
        // 플레이어가 엘리베이터 위에 있는지
        const playerBottom = playerRect.y + playerRect.height;
        const isAboveElevator = playerRect.x + playerRect.width > elevatorRect.x &&
                               playerRect.x < elevatorRect.x + elevatorRect.width;
        
        // 엘리베이터 위에 착지
        if (isAboveElevator && 
            playerBottom >= elevatorTopY - 25 && 
            playerBottom <= elevatorTopY + 35 && 
            gameState.velocityY >= -3) {
            // 엘리베이터 위로 플레이어 이동
            gameState.playerY = elevator.y + elevator.height;
            gameState.velocityY = 0;
            gameState.isJumping = false;
            gameState.isOnGround = true;
            
            // 엘리베이터와 함께 이동
            gameState.playerY += elevator.speed * elevator.direction;
        }
    });
}

// 점프 물리 처리
function handleJump() {
    // 중력 적용
    if (!gameState.isOnGround) {
        gameState.velocityY += gameState.gravity;
    }
    
    // Y 위치 업데이트 (bottom 좌표계이므로 빼기)
    gameState.playerY -= gameState.velocityY;
    
    // 플랫폼 충돌 체크
    checkPlatformCollision();
    
    updatePlayerPosition();
}

// 게임 루프
function gameLoop() {
    // 게임패드 입력은 항상 처리 (게임 오버, 모달 등)
    handleGamepad();
    
    if (!gameState.isRunning) return;
    
    // 일시정지 중이면 게임 로직은 실행하지 않음
    if (gameState.isPaused) return;
    
    // 점프 물리 처리
    handleJump();
    
    // 엘리베이터 업데이트 (모든 챕터)
    if (gameState.elevators.length > 0) {
        updateElevators();
        // 엘리베이터 충돌 체크 (플랫폼처럼)
        checkElevatorCollision();
    }
    
    // 장애물 천천히 좌우 이동 (각 칸 내에서만)
    gameState.obstacles.forEach(obstacle => {
        // 좌우 이동
        obstacle.x += obstacle.velocityX;
        
        // 칸 경계에서 반사
        if (obstacle.x <= obstacle.minX || obstacle.x >= obstacle.maxX) {
            obstacle.velocityX *= -1;
            // 경계 내로 조정
            if (obstacle.x < obstacle.minX) obstacle.x = obstacle.minX;
            if (obstacle.x > obstacle.maxX) obstacle.x = obstacle.maxX;
        }
        
        // 요소 위치 업데이트
        obstacle.element.style.left = obstacle.x + 'px';
    });
    
    // 충돌 체크
    const playerScreenY = gameState.canvasHeight - gameState.playerY - gameState.playerHeight;
    const playerRect = {
        x: gameState.playerX,
        y: playerScreenY,
        width: gameState.playerWidth,
        height: gameState.playerHeight
    };
    
    // 장애물 충돌 체크
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.obstacles[i];
        const obstacleScreenY = gameState.canvasHeight - obstacle.y - obstacle.height;
        const obstacleRect = {
            x: obstacle.x,
            y: obstacleScreenY,
            width: obstacle.width,
            height: obstacle.height
        };
        
        if (checkCollision(playerRect, obstacleRect)) {
            // 플레이어가 위에서 장애물을 밟는지 확인
            const playerBottom = playerRect.y + playerRect.height;
            const obstacleTop = obstacleRect.y;
            const obstacleMiddle = obstacleRect.y + obstacleRect.height / 2;
            
            // 플레이어의 발이 장애물 상단 근처에 있고, 하강 중이면 밟기 성공
            // velocityY > 0이면 하강 중 (bottom 좌표계에서)
            if (playerBottom < obstacleMiddle && gameState.velocityY > 0) {
                // 장애물 제거
                obstacle.element.remove();
                gameState.obstacles.splice(i, 1);
                playStompSound();
                
                // 점수 증가
                gameState.score += 50;
                scoreElement.textContent = `점수: ${gameState.score} | 포스터: ${gameState.postersCollected}/${gameState.totalPostersPerChapter}`;
                
                // 작은 반동 효과
                gameState.velocityY = 8;
                
                // 밟기 성공했으므로 continue
                continue;
            } else {
                // 옆이나 아래에서 부딪히면 게임 오버
                endGame();
            }
        }
    }
    
    // 포스터는 A 키로 수집 (자동 수집 제거)
    
    // 위험 요소 충돌 체크
    gameState.hazards.forEach(hazard => {
        const hazardScreenY = gameState.canvasHeight - hazard.y - hazard.height;
        const hazardRect = {
            x: hazard.x,
            y: hazardScreenY,
            width: hazard.width,
            height: hazard.height
        };
        
        if (checkCollision(playerRect, hazardRect)) {
            endGame();
        }
    });
    
    // 포탈 충돌 체크
    if (gameState.portal) {
        const portalScreenY = gameState.canvasHeight - gameState.portal.y - gameState.portal.height;
        const portalRect = {
            x: gameState.portal.x,
            y: portalScreenY,
            width: gameState.portal.width,
            height: gameState.portal.height
        };
        
        if (checkCollision(playerRect, portalRect)) {
            nextChapter();
        }
    }
}

// 게임패드 입력 처리
let lastGamepadButtons = {};
let gamepadDebugShown = false;
let gamepadInput = {
    left: false,
    right: false,
    down: false
};

function handleGamepad() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;
    
    // 연결된 게임패드 찾기
    let gamepad = null;
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            gamepad = gamepads[i];
            break;
        }
    }
    
    if (!gamepad) return;
    
    // 최초 1회만 디버그 정보 출력
    if (!gamepadDebugShown) {
        console.log('🎮 게임패드 활성화:', gamepad.id);
        console.log('버튼 수:', gamepad.buttons.length);
        gamepadDebugShown = true;
    }
    
    // D-Pad 또는 왼쪽 스틱으로 이동
    const axes = gamepad.axes;
    const buttons = gamepad.buttons;
    
    // 왼쪽 스틱 X축 (axes[0]) 또는 D-Pad 좌우 (buttons[14], buttons[15])
    gamepadInput.left = axes[0] < -0.3 || (buttons[14] && buttons[14].pressed);
    gamepadInput.right = axes[0] > 0.3 || (buttons[15] && buttons[15].pressed);
    
    // 왼쪽 스틱 Y축 (axes[1]) 또는 D-Pad 상하 (buttons[12], buttons[13])
    gamepadInput.down = axes[1] > 0.3 || (buttons[13] && buttons[13].pressed);
    
    // 게임패드로 이동 처리
    if (gamepadInput.left && gameState.isRunning && !gameState.isPaused) {
        if (gameState.playerX > 0) {
            gameState.playerX -= gameState.moveSpeed;
            if (gameState.playerX < 0) gameState.playerX = 0;
            gameState.facingDirection = 'left';
            updatePlayerPosition();
        }
    }
    
    if (gamepadInput.right && gameState.isRunning && !gameState.isPaused) {
        if (gameState.playerX < 800 - gameState.playerWidth) {
            gameState.playerX += gameState.moveSpeed;
            if (gameState.playerX > 800 - gameState.playerWidth) {
                gameState.playerX = 800 - gameState.playerWidth;
            }
            gameState.facingDirection = 'right';
            updatePlayerPosition();
        }
    }
    
    // 아래 방향 - 플랫폼 통과
    if (gamepadInput.down && gameState.isRunning && !gameState.isPaused) {
        if (gameState.isOnGround && gameState.playerY > gameState.groundY) {
            gameState.canDropThrough = true;
            gameState.isOnGround = false;
            gameState.isJumping = true;
            gameState.velocityY = 2;
        } else if (gameState.isJumping && !gameState.isOnGround) {
            gameState.velocityY += 2;
        }
    }
    
    // A 버튼 (버튼 0) - 게임 재시작 / 모달 닫기 / 점프
    if (buttons[0] && buttons[0].pressed) {
        if (!lastGamepadButtons[0]) {
            const gameOverScreen = document.getElementById('gameOver');
            const isGameOver = gameOverScreen && !gameOverScreen.classList.contains('hidden');
            
            // 게임 오버 상태에서는 게임 재시작
            if (isGameOver) {
                console.log('🎮 A 버튼 (버튼 0) - 게임 재시작!');
                startGame();
            }
            // 모달이 열려있으면 모달 닫기
            else if (gameState.isPaused && !posterModal.classList.contains('hidden')) {
                console.log('🎮 A 버튼 (버튼 0) - 모달 닫기');
                closePosterModal();
            }
            // 그 외에는 점프
            else {
                console.log('🎮 A 버튼 (버튼 0) - 점프');
                performJump();
            }
            lastGamepadButtons[0] = true;
        }
    } else {
        lastGamepadButtons[0] = false;
    }
    
    // B 버튼 (버튼 1) - 게임 재시작 / 모달 닫기 / 포스터 수집
    if (buttons[1] && buttons[1].pressed) {
        if (!lastGamepadButtons[1]) {
            const gameOverScreen = document.getElementById('gameOver');
            const isGameOver = gameOverScreen && !gameOverScreen.classList.contains('hidden');
            
            console.log('🎮 B 버튼 눌림 - isRunning:', gameState.isRunning, 'isGameOver:', isGameOver, 'isPaused:', gameState.isPaused);
            
            // 게임 오버 상태에서는 게임 재시작
            if (isGameOver) {
                console.log('🎮 B 버튼 (버튼 1) - 게임 재시작!');
                startGame();
            }
            // 모달이 열려있으면 모달 닫기
            else if (gameState.isPaused && !posterModal.classList.contains('hidden')) {
                console.log('🎮 B 버튼 (버튼 1) - 모달 닫기');
                closePosterModal();
            }
            // 그 외에는 포스터 수집
            else if (gameState.isRunning && !gameState.isPaused) {
                console.log('🎮 B 버튼 (버튼 1) - 포스터 수집');
                collectNearbyPoster();
            }
            lastGamepadButtons[1] = true;
        }
    } else {
        lastGamepadButtons[1] = false;
    }
    
    // X 버튼 (버튼 2) - 게임 재시작 / 모달 닫기 / 점프
    if (buttons[2] && buttons[2].pressed) {
        if (!lastGamepadButtons[2]) {
            const gameOverScreen = document.getElementById('gameOver');
            const isGameOver = gameOverScreen && !gameOverScreen.classList.contains('hidden');
            
            // 게임 오버 상태에서는 게임 재시작
            if (isGameOver) {
                console.log('🎮 X 버튼 (버튼 2) - 게임 재시작!');
                startGame();
            }
            // 모달이 열려있으면 모달 닫기
            else if (gameState.isPaused && !posterModal.classList.contains('hidden')) {
                console.log('🎮 X 버튼 (버튼 2) - 모달 닫기');
                closePosterModal();
            }
            // 그 외에는 점프
            else {
                console.log('🎮 X 버튼 (버튼 2) - 점프');
                performJump();
            }
            lastGamepadButtons[2] = true;
        }
    } else {
        lastGamepadButtons[2] = false;
    }
    
    // Y 버튼 (버튼 3) - 게임 재시작 / 모달 닫기 / 포스터 수집 (대안)
    if (buttons[3] && buttons[3].pressed) {
        if (!lastGamepadButtons[3]) {
            const gameOverScreen = document.getElementById('gameOver');
            const isGameOver = gameOverScreen && !gameOverScreen.classList.contains('hidden');
            
            // 게임 오버 상태에서는 게임 재시작
            if (isGameOver) {
                console.log('🎮 Y 버튼 (버튼 3) - 게임 재시작!');
                startGame();
            }
            // 모달이 열려있으면 모달 닫기
            else if (gameState.isPaused && !posterModal.classList.contains('hidden')) {
                console.log('🎮 Y 버튼 (버튼 3) - 모달 닫기');
                closePosterModal();
            }
            // 그 외에는 포스터 수집
            else if (gameState.isRunning && !gameState.isPaused) {
                console.log('🎮 Y 버튼 (버튼 3) - 포스터 수집');
                collectNearbyPoster();
            }
            lastGamepadButtons[3] = true;
        }
    } else {
        lastGamepadButtons[3] = false;
    }
    
    // 디버그: 스틱 값 출력 (0이 아닐 때만)
    if (Math.abs(axes[0]) > 0.1 || Math.abs(axes[1]) > 0.1) {
        // 콘솔 스팸 방지를 위해 가끔씩만 출력
        if (Math.random() < 0.01) {
            console.log('🎮 스틱 X:', axes[0].toFixed(2), 'Y:', axes[1].toFixed(2));
        }
    }
}

// Space 키로 근처 포스터 수집
function collectNearbyPoster() {
    const playerScreenY = gameState.canvasHeight - gameState.playerY - gameState.playerHeight;
    const playerRect = {
        x: gameState.playerX,
        y: playerScreenY,
        width: gameState.playerWidth,
        height: gameState.playerHeight
    };
    
    // 근처 포스터 찾기 (충돌 범위 확장)
    for (let i = gameState.posters.length - 1; i >= 0; i--) {
        const poster = gameState.posters[i];
        
        const posterScreenY = gameState.canvasHeight - poster.y - poster.height;
        const posterRect = {
            x: poster.x,
            y: posterScreenY,
            width: poster.width,
            height: poster.height
        };
        
        // 확장된 범위로 체크 (플레이어 근처 60px 이내)
        const expandedPlayerRect = {
            x: playerRect.x - 30,
            y: playerRect.y - 30,
            width: playerRect.width + 60,
            height: playerRect.height + 60
        };
        
        if (checkCollision(expandedPlayerRect, posterRect)) {
            collectPoster(poster);
            poster.element.remove();
            gameState.posters.splice(i, 1);
            return; // 하나만 수집
        }
    }
}

// 포스터 수집
function collectPoster(poster) {
    gameState.isPaused = true;
    posterTitle.textContent = "포스터 획득!";
    
    // 수집한 포스터의 이미지 사용
    const posterImageName = poster.imageName || 'poster.jpg';
    posterImage.src = posterImageName;
    
    // 포스터 설명 문구 매핑
    let posterText = "포스터를 획득했습니다!";
    switch (posterImageName) {
        case 'poster.jpg':
        case 'poster.png':
            posterText = "1930-40년대, 2010년대 이후의 도쿄 사진으로 도시와 사진 표현의 변화를 다각도로 살펴보는 전시";
            break;
        case 'poster2.jpg':
        case 'poster2.png':
            posterText = "경북대미술관, 국립군산대미술관, 제주대박물관이 '가족'을 공동체 개념으로 확장해 기획한 옴니버스식 전시";
            break;
        case 'poster3.jpg':
        case 'poster3.png':
            posterText = "기후위기 시대 미술(관)의 역할을 살펴보고 지속가능한 공존을 모색하는 전시";
            break;
        case 'poster4.jpg':
        case 'poster4.png':
            posterText = "학생과 주민이 참여한 배리어프리 프로젝트와 페스티벌로 모두의 공존과 권리를 실천하는 전시";
            break;
        case 'poster5.jpg':
        case 'poster5.png':
            posterText = "당장 눈앞의 미래도 알 수 없는 인간의 삶을 성찰하고 앞으로 나아갈 방향을 다루는 전시";
            break;
        case 'poster6.jpg':
        case 'poster6.png':
            posterText = "프레데릭 벅스의 사진으로 키르기스스탄 유목민의 숭고한 삶과 자연을 느낄 수 있는 전시";
            break;
        case 'poster7.jpg':
        case 'poster7.png':
            posterText = "재개발로 인한 도시 양극화에 관한 작품과 산격동 거주민의 이야기가 교차하는 개인과 도시의 기억 전시";
            break;
        case 'poster8.jpg':
        case 'poster8.png':
            posterText = "다양한 장르 영상과 영화 제작 아카이브로 지역 독립영화를 체험하며 미술과 영화의 경계를 허무는 전시";
            break;
        case 'poster9.jpg':
        case 'poster9.png':
            posterText = "웃음을 유발하는 농담의 새로운 가치를 발견하고 농담의 의미를 새롭게 바라보는 전시";
            break;
        case 'poster10.jpg':
        case 'poster10.png':
            posterText = "소녀만화가 수동적 이미지에서 여성의 열망을 반영하는 서사로 변화한 과정을 3세대로 구분해 조명하는 전시";
            break;
        case 'poster11.jpg':
        case 'poster11.png':
            posterText = "요크 힐버트의 원화와 드로잉, 책, 애니메이션, 음악, 동화게임을 통해 아이와 어른 모두 상상력과 동심을 체험하는 전시";
            break;
        case 'poster12.jpg':
        case 'poster12.png':
            posterText = "[2012 한·일 우키요에전 - 우키요에로 보는 한·일 풍경] 일본인이 사랑한 일본과 한국의 절경을 우키요에로 소개하는 전시";
            break;
        case 'poster13.jpg':
        case 'poster13.png':
            posterText = "독도의 역사와 의미를 고지도 속에서 되짚어보는 전시";
            break;
        case 'poster14.jpg':
        case 'poster14.png':
            posterText = "부산근대영화사의 저자 홍영철의 프랑스 영화 자료로 역사와 예술, 낭만을 느껴보는 전시";
            break;
        case 'poster15.jpg':
        case 'poster15.png':
            posterText = "시그마 폴케의 재료와 양식적 실험이 집약된 과슈 작품을 소개하며, 격변하는 독일 현대미술의 실험정신을 보여주는 전시";
            break;
        default:
            break;
    }
    
    posterImage.alt = "포스터";
    posterDescription.textContent = posterText;
    continueBtn.textContent = "계속하기";
    posterModal.classList.remove('hidden');
    playPosterSound();
    gameState.score += 50;
    gameState.postersCollected++;
    gameState.currentPosterIndex++;
    scoreElement.textContent = `점수: ${gameState.score} | 포스터: ${gameState.postersCollected}/${gameState.totalPostersPerChapter}`;
    
    // 전체 수집 목록에 추가
    gameState.collectedPosters.push({
        image: posterImageName,
        description: posterText
    });
    
    // 하나 먹으면 하나 생김 (5개 도달 전까지)
    if (gameState.postersCollected < gameState.totalPostersPerChapter) {
        // 모달 닫힐 때 새 포스터 생성하도록 플래그 설정
        gameState.shouldCreatePoster = true;
    } else if (gameState.postersCollected === gameState.totalPostersPerChapter) {
        // 5개 다 먹으면 포탈 생성
        setTimeout(() => {
            createPortal();
        }, 500);
    }
}

// 챕터별 엘리베이터 데이터
function getElevatorData(chapter) {
    if (chapter === 1) {
        // 챕터 1: 중간 간격에 엘리베이터
        return [
            { x: 400, startY: 150, endY: 300, speed: 1.2, currentY: 150, direction: 1, width: 80 }
        ];
    } else if (chapter === 2) {
        // 챕터 2: 2개의 엘리베이터
        return [
            { x: 370, startY: 180, endY: 360, speed: 1, currentY: 180, direction: 1, width: 90 },
            { x: 150, startY: 120, endY: 280, speed: 1.3, currentY: 280, direction: -1, width: 80 }
        ];
    } else if (chapter === 3) {
        // 챕터 3: 3개의 빠른 엘리베이터
        return [
            { x: 180, startY: 100, endY: 350, speed: 1.5, currentY: 100, direction: 1, width: 70 },
            { x: 400, startY: 120, endY: 440, speed: 1.3, currentY: 440, direction: -1, width: 70 },
            { x: 650, startY: 100, endY: 350, speed: 1.4, currentY: 220, direction: 1, width: 70 }
        ];
    }
    return [];
}

// 엘리베이터 생성
function createElevators() {
    const elevatorData = getElevatorData(gameState.chapter);
    
    elevatorData.forEach(elev => {
        const elevator = document.createElement('div');
        elevator.className = 'elevator';
        
        // 챕터별 엘리베이터 색상 클래스 추가
        if (gameState.chapter === 1) {
            elevator.classList.add('elevator-chapter1');
        } else if (gameState.chapter === 2) {
            elevator.classList.add('elevator-chapter2');
        } else if (gameState.chapter === 3) {
            elevator.classList.add('elevator-chapter3');
        }
        
        elevator.style.left = elev.x + 'px';
        elevator.style.bottom = elev.currentY + 'px';
        elevator.style.width = elev.width + 'px';
        elevator.style.height = '20px';
        gameCanvas.appendChild(elevator);
        
        gameState.elevators.push({
            element: elevator,
            x: elev.x,
            y: elev.currentY,
            startY: elev.startY,
            endY: elev.endY,
            speed: elev.speed,
            direction: elev.direction,
            width: elev.width,
            height: 20
        });
    });
}

// 엘리베이터 업데이트
function updateElevators() {
    gameState.elevators.forEach(elevator => {
        // 엘리베이터 이동
        elevator.y += elevator.speed * elevator.direction;
        
        // 방향 전환
        if (elevator.y <= elevator.startY || elevator.y >= elevator.endY) {
            elevator.direction *= -1;
        }
        
        // 위치 업데이트
        elevator.element.style.bottom = elevator.y + 'px';
    });
}

// 챕터별 배경 설정
function setChapterBackground() {
    const gameContainer = document.getElementById('gameContainer');
    
    // 챕터별 배경 설정
    if (gameState.chapter === 1) {
        gameContainer.style.backgroundImage = 'url("ba.png")';
    } else if (gameState.chapter === 2) {
        gameContainer.style.backgroundImage = 'url("ba2.png")';
    } else {
        gameContainer.style.backgroundImage = 'url("ba3.png")';
    }
    gameContainer.style.backgroundColor = '#FFB6C1';
    gameContainer.style.backgroundSize = 'cover';
    gameContainer.style.backgroundPosition = 'center';
}

// 다음 챕터
function nextChapter() {
    if (gameState.chapter >= gameState.maxChapter) {
        // 게임 클리어
        stopAllMusic();
        stopPortalSound();
        playViewSound();
        showPosterGallery();
        return;
    }
    
    gameState.chapter++;
    gameState.postersCollected = 0;
    gameState.currentPosterIndex = 0;
    
    // 기존 요소 제거
    gameState.obstacles.forEach(obs => obs.element.remove());
    gameState.posters.forEach(poster => poster.element.remove());
    gameState.platforms.forEach(platform => platform.element.remove());
    gameState.elevators.forEach(elevator => elevator.element.remove());
    gameState.hazards.forEach(hazard => hazard.element.remove());
    removePortal();
    
    gameState.obstacles = [];
    gameState.posters = [];
    gameState.platforms = [];
    gameState.elevators = [];
    gameState.hazards = [];
    
    // 챕터별 배경 설정
    setChapterBackground();
    
    // 챕터별 음악 재생
    playMusicForChapter(gameState.chapter);
    
    // 새 플랫폼 생성
    createPlatforms();
    
    // 엘리베이터 생성 (챕터 2)
    createElevators();
    
    // 플레이어 위치 초기화 (안전한 위치)
    // 챕터별 시작 위치 설정
    if (gameState.chapter === 1) {
        gameState.playerX = 100;
        gameState.playerY = gameState.groundY;
    } else if (gameState.chapter === 2) {
        gameState.playerX = 100;
        gameState.playerY = gameState.groundY;
    } else if (gameState.chapter === 3) {
        // 챕터 3은 왼쪽 끝 플랫폼 위에서 시작
        gameState.playerX = 50;
        gameState.playerY = 120; // 첫 번째 플랫폼 위
    }
    
    gameState.velocityY = 0;
    gameState.isJumping = false;
    gameState.isOnGround = true;
    
    // 새 장애물과 포스터 생성
    createInitialObstacles();
    createInitialPosters();
    
    scoreElement.textContent = `점수: ${gameState.score} | 포스터: 0/${gameState.totalPostersPerChapter}`;
    
    // 스테이지 인트로 표시
    showStageIntro(gameState.chapter);
}

// 모달 닫기
function closePosterModal() {
    posterModal.classList.add('hidden');
    gameState.isPaused = false;
    
    // 다음 포스터 생성 (5개 미만일 때만)
    if (gameState.shouldCreatePoster) {
        createPoster();
        gameState.shouldCreatePoster = false;
    }
}

// 게임 종료
function endGame() {
    gameState.isRunning = false;
    // 배경 음악 즉시 정지
    stopAllMusic();
    
    finalScoreElement.textContent = gameState.score;
    gameOverScreen.classList.remove('hidden');
    playOverSound();
    // 게임 루프는 계속 실행 (게임패드 입력 처리를 위해)
    // gameLoop에서 isRunning을 체크하므로 게임 로직은 실행되지 않음
}

// 게임 시작
function startGame() {
    // 시작 화면 숨기기
    startScreen.classList.add('hidden');
    gameCanvas.classList.remove('hidden');
    if (posterGallery) posterGallery.classList.add('hidden');
    
    // 음악 정지 (게임 시작/재시작 시)
    stopAllMusic();
    stopPortalSound();
    stopViewSound();
    
    // 포탈 사운드 정지
    if (portalSound) {
        portalSound.pause();
        portalSound.currentTime = 0;
    }
    
    // 초기화
    gameState.score = 0;
    gameState.chapter = 1;
    gameState.postersCollected = 0;
    gameState.currentPosterIndex = 0;
    gameState.shouldCreatePoster = false;
    gameState.isRunning = true;
    gameState.isPaused = false;
    gameState.playerX = 100;
    gameState.playerY = gameState.groundY;
    gameState.isJumping = false;
    gameState.isOnGround = true;
    gameState.velocityY = 0;
    gameState.canvasHeight = 600;
    gameState.obstacles = [];
    gameState.posters = [];
    gameState.platforms = [];
    gameState.elevators = [];
    gameState.hazards = [];
    gameState.portal = null;
    
    // UI 초기화
    scoreElement.textContent = `점수: 0 | 포스터: 0/${gameState.totalPostersPerChapter}`;
    gameOverScreen.classList.add('hidden');
    gameCanvas.innerHTML = '';
    
    // 챕터별 배경 설정
    setChapterBackground();
    
    // 플랫폼 생성
    createPlatforms();
    
    // 엘리베이터 생성 (챕터 2)
    createElevators();
    
    // 플레이어 생성
    createPlayer();
    
    // 초기 장애물과 포스터 생성
    createInitialObstacles();
    createInitialPosters();
    
    // 챕터 1 음악 재생
    playMusicForChapter(gameState.chapter);
    
    // 스테이지 인트로 표시
    showStageIntro(gameState.chapter);
    
    // 게임 루프 시작
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
    }
    gameState.gameLoop = setInterval(gameLoop, 16); // 약 60fps
}

// 초기 게임 화면 설정 (시작 화면에서 보이도록)
function initializeGameScreen() {
    // 게임 화면은 보이되 블러 처리될 예정
    gameCanvas.classList.remove('hidden');
    
    // 초기화 (게임은 시작하지 않음)
    gameState.isRunning = false;
    gameState.chapter = 1;
    gameCanvas.innerHTML = '';
    
    // 챕터별 배경 설정
    setChapterBackground();
    
    // 플랫폼 생성
    createPlatforms();
    
    // 엘리베이터 생성
    createElevators();
    
    // 플레이어 생성 (움직이지 않음)
    createPlayer();
    
    // 초기 장애물과 포스터 생성
    createInitialObstacles();
    createInitialPosters();
    
}

// 키보드 입력
let keys = {};
let moveInterval = null;

function handleMovement() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    // 왼쪽 이동 (WASD, 방향키, 게임패드)
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
        if (gameState.playerX > 0) {
            gameState.playerX -= gameState.moveSpeed;
            if (gameState.playerX < 0) gameState.playerX = 0;
            gameState.facingDirection = 'left';
            updatePlayerPosition();
        }
    }
    
    // 오른쪽 이동 (WASD, 방향키, 게임패드)
    if (keys['d'] || keys['D'] || keys['ArrowRight']) {
        if (gameState.playerX < 800 - gameState.playerWidth) {
            gameState.playerX += gameState.moveSpeed;
            if (gameState.playerX > 800 - gameState.playerWidth) {
                gameState.playerX = 800 - gameState.playerWidth;
            }
            gameState.facingDirection = 'right';
            updatePlayerPosition();
        }
    }
    
    // 아래 이동 - 플랫폼 통과 및 빠른 낙하 (S, 아래 방향키, 게임패드)
    if (keys['s'] || keys['S'] || keys['ArrowDown']) {
        // 플랫폼 위에 있을 때 아래를 누르면 플랫폼 통과
        if (gameState.isOnGround && gameState.playerY > gameState.groundY) {
            gameState.canDropThrough = true;
            gameState.isOnGround = false;
            gameState.isJumping = true;
            gameState.velocityY = 2; // 아래로 밀어내기
        }
        // 공중에 있을 때는 빠른 낙하
        else if (gameState.isJumping && !gameState.isOnGround) {
            gameState.velocityY += 2; // 빠르게 내려가기
        }
    }
}

// 점프 함수
function performJump() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    // 바닥이나 플랫폼 위에 있을 때만 점프 가능
    if (gameState.isOnGround) {
        gameState.isJumping = true;
        gameState.isOnGround = false;
        gameState.velocityY = -gameState.jumpStrength;
        playJumpSound();
    }
}

function playJumpSound() {
    if (!jumpSound) return;
    try {
        jumpSound.currentTime = 0;
        jumpSound.play().catch(() => {});
    } catch (e) {
        console.log('점프 사운드 재생 실패:', e);
    }
}

function playStompSound() {
    if (!stompSound) return;
    try {
        stompSound.currentTime = 0;
        stompSound.play().catch(() => {});
    } catch (e) {
        console.log('장애물 밟기 사운드 재생 실패:', e);
    }
}

function playPosterSound() {
    if (!posterSound) return;
    try {
        posterSound.playbackRate = 3;
        posterSound.currentTime = 0;
        posterSound.play().catch(() => {});
    } catch (e) {
        console.log('포스터 사운드 재생 실패:', e);
    }
}

function playOverSound() {
    if (!overSound) return;
    try {
        overSound.volume = 1;
        overSound.playbackRate = 1;
        overSound.currentTime = 0;
        overSound.play().catch(() => {});
    } catch (e) {
        console.log('게임 오버 사운드 재생 실패:', e);
    }
}

// 포스터 갤러리
function showPosterGallery() {
    if (!posterGallery) return;
    const galleryTitle = document.getElementById('galleryTitle');
    if (galleryTitle) {
        galleryTitle.textContent = '모든 포스터를 모았어요!';
    }
    gameState.isRunning = false;
    gameState.isPaused = true;
    gameState.galleryIndex = 0;
    
    // poster.jpg ~ poster15.jpg를 순서대로 준비 (수집 여부와 무관)
    const posterOrder = [];
    for (let i = 1; i <= 15; i++) {
        const posterName = i === 1 ? 'poster.jpg' : `poster${i}.jpg`;
        posterOrder.push({
            image: posterName,
            description: getPosterDescription(posterName)
        });
    }
    gameState.sortedPosters = posterOrder;
    
    // 갤러리 사운드 재생
    playViewSound();
    
    if (gameState.sortedPosters.length > 0) {
        updatePosterGallery();
    } else {
        galleryImage.src = '';
        galleryDesc.textContent = '수집한 포스터가 없습니다.';
        galleryCounter.textContent = '0/0';
    }
    posterGallery.classList.remove('hidden');
}

function hidePosterGallery() {
    posterGallery.classList.add('hidden');
    stopViewSound();
    startGame();
}

function updatePosterGallery() {
    const sortedPosters = gameState.sortedPosters || gameState.collectedPosters;
    const item = sortedPosters[gameState.galleryIndex];
    if (!item) return;
    galleryImage.src = item.image;
    galleryDesc.textContent = item.description;
    galleryCounter.textContent = `${gameState.galleryIndex + 1}/${sortedPosters.length}`;
}

function nextGalleryItem() {
    const sortedPosters = gameState.sortedPosters || gameState.collectedPosters;
    if (sortedPosters.length === 0) return;
    gameState.galleryIndex = (gameState.galleryIndex + 1) % sortedPosters.length;
    updatePosterGallery();
}

function prevGalleryItem() {
    const sortedPosters = gameState.sortedPosters || gameState.collectedPosters;
    if (sortedPosters.length === 0) return;
    gameState.galleryIndex = (gameState.galleryIndex - 1 + sortedPosters.length) % sortedPosters.length;
    updatePosterGallery();
}

function playViewSound() {
    if (!viewSound) return;
    try {
        viewSound.loop = true;
        if (viewSound.paused) {
            viewSound.play().catch(() => {});
        }
    } catch (e) {
        console.log('갤러리 사운드 재생 실패:', e);
    }
}

// 포스터 설명 가져오기 (갤러리용)
function getPosterDescription(posterImageName) {
    const baseName = posterImageName.replace('.jpg', '').replace('.png', '');
    const normalizedName = baseName === 'poster' ? 'poster.jpg' : `${baseName}.jpg`;
    
    let posterText = "포스터를 획득했습니다!";
    switch (normalizedName) {
        case 'poster.jpg':
            posterText = "1930-40년대, 2010년대 이후의 도쿄 사진으로 도시와 사진 표현의 변화를 다각도로 살펴보는 전시";
            break;
        case 'poster2.jpg':
            posterText = "경북대미술관, 국립군산대미술관, 제주대박물관이 '가족'을 공동체 개념으로 확장해 기획한 옴니버스식 전시";
            break;
        case 'poster3.jpg':
            posterText = "기후위기 시대 미술(관)의 역할을 살펴보고 지속가능한 공존을 모색하는 전시";
            break;
        case 'poster4.jpg':
            posterText = "학생과 주민이 참여한 배리어프리 프로젝트와 페스티벌로 모두의 공존과 권리를 실천하는 전시";
            break;
        case 'poster5.jpg':
            posterText = "당장 눈앞의 미래도 알 수 없는 인간의 삶을 성찰하고 앞으로 나아갈 방향을 다루는 전시";
            break;
        case 'poster6.jpg':
            posterText = "프레데릭 벅스의 사진으로 키르기스스탄 유목민의 숭고한 삶과 자연을 느낄 수 있는 전시";
            break;
        case 'poster7.jpg':
            posterText = "재개발로 인한 도시 양극화에 관한 작품과 산격동 거주민의 이야기가 교차하는 개인과 도시의 기억 전시";
            break;
        case 'poster8.jpg':
            posterText = "다양한 장르 영상과 영화 제작 아카이브로 지역 독립영화를 체험하며 미술과 영화의 경계를 허무는 전시";
            break;
        case 'poster9.jpg':
            posterText = "웃음을 유발하는 농담의 새로운 가치를 발견하고 농담의 의미를 새롭게 바라보는 전시";
            break;
        case 'poster10.jpg':
            posterText = "소녀만화가 수동적 이미지에서 여성의 열망을 반영하는 서사로 변화한 과정을 3세대로 구분해 조명하는 전시";
            break;
        case 'poster11.jpg':
            posterText = "책을 고정된 매체가 아닌 언어와 감각의 상호작용 속에서 생성되는 예술적 경험으로 제안하는 전시";
            break;
        case 'poster12.jpg':
            posterText = "디지털 매체가 일상화된 오늘날, 아날로그 사진의 물질성과 그것을 다루는 사람들의 작업에 대한 가치와 감각의 의미를 재조명하는 전시";
            break;
        case 'poster13.jpg':
            posterText = "요크 힐버트의 원화와 드로잉, 책, 애니메이션, 음악, 동화게임을 통해 아이와 어른 모두 상상력과 동심을 체험하는 전시";
            break;
        case 'poster14.jpg':
            posterText = "유리라는 매체에 생명력을 불어넣으며 조형 예술의 경계를 확장해 온 데일 치훌리의 독보적인 예술 세계와 끊임없는 실험 정신을 조망하는 전시";
            break;
        case 'poster15.jpg':
            posterText = "시그마 폴케의 재료와 양식적 실험이 집약된 과슈 작품을 소개하며, 격변하는 독일 현대미술의 실험정신을 보여주는 전시";
            break;
        default:
            break;
    }
    return posterText;
}

document.addEventListener('keydown', (e) => {
    // Q - 다음 챕터로 이동 (테스트용)
    if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        if (gameState.isRunning && !gameState.isPaused) {
            // 포스터를 5개 먹은 것처럼 설정하고 포탈 생성
            gameState.postersCollected = gameState.totalPostersPerChapter;
            createPortal();
        }
        return;
    }
    
    // W, 위 방향키 - 점프
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        e.preventDefault();
        keys[e.key] = true;
        performJump();
        return;
    }
    
    // Space 키 - 게임 재시작 / 모달 닫기 / 포스터 수집
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        const gameOverScreen = document.getElementById('gameOver');
        const isGameOver = gameOverScreen && !gameOverScreen.classList.contains('hidden');
        
        // 갤러리 열려 있으면 Space 무시
        if (posterGallery && !posterGallery.classList.contains('hidden')) {
            return;
        }
        
        if (isGameOver) {
            console.log('⌨️ Space - 게임 재시작!');
            startGame();
        } else if (gameState.isPaused && !posterModal.classList.contains('hidden')) {
            closePosterModal();
        } else if (gameState.isRunning && !gameState.isPaused) {
            collectNearbyPoster();
        }
        return;
    }
    
    // Enter 키 - 게임 재시작 (게임 오버 시)
    if (e.key === 'Enter') {
        e.preventDefault();
        const gameOverScreen = document.getElementById('gameOver');
        const isGameOver = gameOverScreen && !gameOverScreen.classList.contains('hidden');
        
        if (isGameOver) {
            console.log('⌨️ Enter - 게임 재시작!');
            startGame();
        }
        return;
    }
    
    if (!gameState.isRunning || gameState.isPaused) return;
    
    // WASD, 방향키 처리
    if (e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D' || 
        e.key === 's' || e.key === 'S' || e.key === 'ArrowLeft' || 
        e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        keys[e.key] = true;
        
        // 이동 시작 (연속 이동을 위해)
        if (!moveInterval) {
            moveInterval = setInterval(handleMovement, 16);
        }
    }
});

document.addEventListener('keyup', (e) => {
    // W, 위 방향키 처리
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        keys[e.key] = false;
        return;
    }
    
    // WASD, 방향키 처리
    if (e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D' || 
        e.key === 's' || e.key === 'S' || e.key === 'ArrowLeft' || 
        e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        keys[e.key] = false;
        
        // 모든 이동 키가 떼어지면 인터벌 정리
        if (!keys['a'] && !keys['A'] && !keys['d'] && !keys['D'] && 
            !keys['s'] && !keys['S']) {
            if (moveInterval) {
                clearInterval(moveInterval);
                moveInterval = null;
            }
        }
    }
});

// 이벤트 리스너
restartBtn.addEventListener('click', startGame);
continueBtn.addEventListener('click', closePosterModal);
closeModal.addEventListener('click', closePosterModal);

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (e) => {
    if (e.target === posterModal) {
        closePosterModal();
    }
});

// 스테이지 인트로 표시
function showStageIntro(chapter, previewOnly = false) {
    if (!stageOverlay || !stageTitleEl || !stageSubtitleEl) return;
    
    const subtitles = {
        1: '저주받은 숲',
        2: '용이 잠들어 있는 협곡',
        3: '얼음 마녀의 집'
    };
    const themes = {
        1: { title: '#22C55E', sub: '#15803D', border: 'rgba(34,197,94,0.9)' },
        2: { title: '#EF4444', sub: '#B91C1C', border: 'rgba(239,68,68,0.9)' },
        3: { title: '#2563EB', sub: '#1D4ED8', border: 'rgba(37,99,235,0.9)' }
    };
    
    stageTitleEl.textContent = `CHAPTER ${chapter}`;
    stageSubtitleEl.textContent = subtitles[chapter] || '';
    
    const theme = themes[chapter] || themes[1];
    if (stageBox) {
        stageBox.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        stageBox.style.border = `2px solid ${theme.border}`;
        stageBox.style.boxShadow = `0 12px 32px ${theme.border}`;
    }
    stageTitleEl.style.color = theme.title;
    stageSubtitleEl.style.color = theme.sub;
    
    stageOverlay.classList.remove('hidden');
    
    // 잠시 멈춤
    const wasPaused = gameState.isPaused;
    if (!previewOnly) {
        gameState.isPaused = true;
    }
    
    setTimeout(() => {
        stageOverlay.classList.add('hidden');
        if (!previewOnly) {
            gameState.isPaused = wasPaused;
        }
    }, 1300);
}

// 음악 컨트롤
function stopAllMusic() {
    [chapter1Music, chapter2Music, chapter3Music].forEach(m => {
        if (!m) return;
        try {
            m.pause();
            m.currentTime = 0;
        } catch (e) {
            console.log('음악 정지 실패:', e);
        }
    });
}

function playMusicForChapter(chapter) {
    stopAllMusic();
    const target =
        chapter === 1 ? chapter1Music :
        chapter === 2 ? chapter2Music :
        chapter === 3 ? chapter3Music : null;
    if (!target) return;
    target.loop = true;
    target.play().catch(err => {
        console.log('음악 재생 실패:', err);
    });
}

function stopPortalSound() {
    if (portalSound) {
        try {
            portalSound.pause();
            portalSound.currentTime = 0;
        } catch (e) {
            console.log('포탈 사운드 정지 실패:', e);
        }
    }
}

function stopViewSound() {
    if (viewSound) {
        try {
            viewSound.pause();
            viewSound.currentTime = 0;
        } catch (e) {
            console.log('갤러리 사운드 정지 실패:', e);
        }
    }
}

window.addEventListener('gamepaddisconnected', (e) => {
    console.log('🎮 게임패드 연결 해제됨:', e.gamepad.id);
});

// 페이지 로드 시 이미 연결된 게임패드 확인
function checkExistingGamepads() {
    const gamepads = navigator.getGamepads();
    if (gamepads) {
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                console.log('🎮 기존 게임패드 감지됨:', gamepads[i].id);
                break;
            }
        }
    }
}

// 초기 게임 화면 설정 (시작 화면에서 보이도록)
initializeGameScreen();

// START 버튼 클릭 이벤트
startBtn.addEventListener('click', startGame);

// 갤러리 버튼 이벤트
if (galleryPrev) galleryPrev.addEventListener('click', prevGalleryItem);
if (galleryNext) galleryNext.addEventListener('click', nextGalleryItem);
if (galleryClose) galleryClose.addEventListener('click', hidePosterGallery);

// 갤러리 키보드 이동
document.addEventListener('keydown', (e) => {
    if (!posterGallery || posterGallery.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevGalleryItem();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextGalleryItem();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        hidePosterGallery();
    }
});

// 게임패드 확인
checkExistingGamepads();

