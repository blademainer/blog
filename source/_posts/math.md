title: math
date: 2019-02-24 14:15:35
category:
tags:
mathjax: true
top: true 
---

$$\begin{equation}
e=mc^2
\end{equation}$$

<!-- more -->

Into Newton's Second Law of Motion:
$$\begin{equation}
\mathbf F = \dfrac {\mathrm d}{\mathrm d t} \left({m \mathbf v}\right)
\end{equation}$$

we substitute Einstein's Mass-Velocity Equation:
$$\begin{equation}
m = \dfrac {m_0} {\sqrt {1 - \dfrac {v^2} {c^2}}}
\end{equation}$$

to obtain:
$$\begin{equation}
\mathbf F = \dfrac {\mathrm d} {\mathrm d t} \left({\dfrac {m_0 \mathbf v}{\sqrt{1 - \dfrac {v^2}{c^2}}}}\right)
\end{equation}$$

Then we perform the differentiation with respect to time:
$$\begin{equation}
\frac{\mathrm d}{\mathrm d t} \left({\frac {\mathbf v}{\sqrt{1 - \dfrac {v^2}{c^2} } } }\right) \\ 
= \frac{\mathrm d}{\mathrm d v} \left({\frac {\mathbf v}{\sqrt{1 - \dfrac {v^2}{c^2} } } }\right) \frac{\mathrm d v}{\mathrm d t} \\
= \mathbf a \left({\frac {\sqrt{1 - \dfrac {v^2}{c^2} } - \dfrac v 2 \dfrac 1 {\sqrt{1 - \dfrac {v^2}{c^2} } } \dfrac{-2 v}{c^2} } {1 - \dfrac {v^2}{c^2} } }\right) \\
= \mathbf a \left({\frac {c^2 \left({1 - \dfrac {v^2}{c^2} }\right) + v^2} {c^2 \left({1 - \dfrac {v^2}{c^2} }\right)^{3/2} } }\right) \\
= \mathbf a \left({\frac 1 {\left({1 - \dfrac {v^2}{c^2} }\right)^{3/2} } }\right)
\end{equation}$$

Thus we arrive at the form:
$$\begin{equation}
\mathbf F = \dfrac {m_0 \mathbf a} {\left({1 - \dfrac{v^2}{c^2}}\right)^{\tfrac 3 2}}
\end{equation}$$

where:
- 𝐅 is the force on the body
- 𝐚 is the acceleration induced on the body
- 𝑣 is the magnitude of the velocity of the body
- 𝑐 is the speed of light
- 𝑚<sub>0</sub> is the rest mass of the body.

Without loss of generality, assume that the body is starting from rest at the origin of a cartesian coordinate plane.

Assume the force 𝐅 on the body is in the positive direction along the x-axis.

To simplify the work, we consider the acceleration as a scalar quantity and write it 𝑎.

Thus, from the Chain Rule:

$$\begin{equation}
a = \dfrac{\mathrm d v}{\mathrm d t} = \dfrac{\mathrm d v}{\mathrm d x} \dfrac {\mathrm d x}{\mathrm d t} = v \dfrac {\mathrm d v} {\mathrm d x}
\end{equation}$$

Then from the definition of energy:
$$\begin{equation}
\displaystyle E = \int_0^x F \mathrm d x
\end{equation}$$

which leads us to:

$$\begin{equation}
\begin{aligned}
E &= m_0 \int_0^x \frac a {\left({1 - v^2 / c^2}\right)^{\tfrac 3 2} } \ \mathrm d x \\
  &= m_0 \int_0^v \frac v {\left({1 - v^2 / c^2}\right)^{\tfrac 3 2} } \ \mathrm d v \\
  &= m_0 \left({- \frac {c^2} 2}\right) \int_0^v \left({1 - \frac {v^2} {c^2} }\right)^{-\tfrac 3 2} \left({- \frac {2 v \ \mathrm d v} {c^2} }\right) \\
  &= \left[{m_0 c^2 \left({1 - \frac {v^2} {c^2} }\right)^{- \tfrac 1 2} }\right]_0^v \\
  &= m_0 c^2 \left({\frac 1 {\sqrt {1 - \frac {v^2} {c^2} } } - 1}\right) \\
  &= c^2 \left({\frac {m_0} {\sqrt {1 - \frac {v^2} {c^2} } } - m_0}\right) \\
  &= c^2 \left({m - m_0}\right) \\
  &= M c^2
\end{aligned}
\end{equation}$$


$$\begin{equation}
e=mc^2
\end{equation}$$



