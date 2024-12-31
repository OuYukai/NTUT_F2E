document.querySelectorAll('.card').forEach(card => {
    const rotateImage = document.querySelector('.rotate-image img');

    let isSpinning = false; 

    card.addEventListener('mouseover', () => {
      if (rotateImage) {
            rotateImage.style.animation = 'spin 1s linear infinite';
            isSpinning = true;
      }
    });
  
    card.addEventListener('mouseout', () => {
        if (rotateImage && isSpinning) {
            const computedStyle = getComputedStyle(rotateImage);
            const transformMatrix = computedStyle.transform;
      
            // 計算當前旋轉角度
            const currentAngle = getRotationAngle(transformMatrix);
      
            // 確保動畫是順時針旋轉回到 0 度
            const targetAngle = currentAngle <= 0 ? currentAngle : currentAngle - 360;
      
            // 停止無限旋轉動畫
            rotateImage.style.animation = ''; // 停止無限旋轉動畫
            rotateImage.style.transition = 'transform 1s ease-out';
            rotateImage.style.transform = `rotate(${targetAngle}deg)`; // 繼續順時針旋轉到下一圈的 0 度
      
            // 回到 0 度
            setTimeout(() => {
              rotateImage.style.transform = 'rotate(0deg)';
              isSpinning = false;
            }, 10); // 微小延遲確保平滑過渡
        }
    });

    // 計算旋轉角度的函數
    function getRotationAngle(transformMatrix) {
      if (!transformMatrix || transformMatrix === 'none') return 0;
    
      const match = transformMatrix.match(/matrix\((.+)\)/);
      if (!match) return 0; // 如果匹配失敗，返回 0
    
      const values = match[1].split(', ');
      const a = parseFloat(values[0]);
      const b = parseFloat(values[1]);
      const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    
      return angle; // 確保返回的角度是正值
    }
  });
  